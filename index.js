"use strict";
const CQHttp = require('cqhttp');
const spawnSync = require('child_process').spawnSync;
const fs = require("fs");
const config = require("./config.json");

const bot = new CQHttp(config.launch);
const db = require('./database.js');

function reply(data, rep) { 
	const send_data = {
		...data,
		message: rep,
	};
	/*switch (data.message_type) { 
		case "group": { 
			send_data.group_id = data.group_id;
			bot("send_group_msg", send_data);
			break;
		}
		case "private": { 
			send_data.user_id = data.user_id;
			bot("send_private_msg", send_data);
			break;
		}
		case "discuss": { 
			send_data.discuss_id = data.discuss_id;
			bot("send_discuss_msg", send_data);
			break;
		}
	}*/
	bot("send_msg", send_data);
}

function load_databases() { 
	db.load("./ygopro/cards.cdb");
	if (fs.existsSync("./ygopro/expansions")) { 
		fs.readdir("./ygopro/expansions", (err, list) => {
			if (err) {
				log.warn("srvpro-coolq:", "Failed reading expansions folder.", err);
			} else {
				for (var file of list) { 
					if (!file.endsWith(".cdb")) { 
						continue;
					}
					const path = "./ygopro/expansions/" + file;
					db.load(path);
				}
			}
		});
	}
}

function concat_name(name, num) {
	if (!name[num]) {
		return null;
	}
	var res = name[num];
	var count = num + 1;
	while (true) {
		const temp = name[count];
		if (!temp) {
			break;
		}
		res = res + " " + temp;
		++count;
	}
	return res;
  }

function send_help(data) { 
	reply(data, "输入 :help 查看本帮助。\n输入 :roomlist 查看房间列表。\n输入 :testcard 卡号 测试卡片红字。");
}
function get_roomlist(data) { 
	var rep = "房间列表：\n";
	var count = 0;
	for (var room of ROOM_all) { 
		if (!room || !room.established) { 
			continue;
		}
		++count;
		rep += count + "   " + room.name.split('$', 2)[0] + "   "
		var player_slot = [];
		for (var player of room.get_playing_player()) { 
			player_slot[player.pos] = player;
		}
		if (room.hostinfo.mode === 2) {
			rep += (player_slot[0] ? player_slot[0].name : "???") + " & " + (player_slot[1] ? player_slot[1].name : "???") + " VS " + (player_slot[2] ? player_slot[2].name : "???") + " & " + (player_slot[3] ? player_slot[3].name : "???");
		} else { 
			rep += (player_slot[0] ? player_slot[0].name : "???") + " VS " + (player_slot[1] ? player_slot[1].na本me : "???");
		}
		rep += "\n"
	}
	reply(data, rep);
}

function test_card(data, parsed_msg) { 
	const info = concat_name(parsed_msg, 1);
	if (!info) { 
		send_help(data);
		return;
	}
	const card = db.query_card(info);
	if (!card) { 
		reply(data, "卡片 " + info + " 未找到。");
		return;
	}
	const code = card.id;
	const output = spawnSync("./ygopro", [code], {
		cwd: "./ygopro"
	});
	const result = output.stderr;
	if (!result || !result.length) {
		reply(data, "卡片 " + db.format_name_and_code(card) + " 没有红字。");
	} else { 
		reply(data, "卡片 " + db.format_name_and_code(card) + " 有红字，请尽快修复。\n"+result);
	}
}

bot.on("message", (data) => { 
	if (!(data.group_id && config.allowed_ids.indexOf(data.group_id) != -1 || data.user_id && config.allowed_ids.indexOf(data.user_id) != -1))
		return;
	const msg = data.message;
	const parsed_msg = msg.split(" ");
	if (!parsed_msg[0].startsWith(":")) { 
		return;
	}
	switch (parsed_msg[0]) { 
		case ":roomlist": { 
			get_roomlist(data);
			break;
		}
		case ":testcard": {
			test_card(data, parsed_msg);
			break;
		}
		default: { 
			send_help(data);
			break;
		}
	}
});
load_databases();
bot.listen(config.port, config.address);
