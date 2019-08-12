const CQHttp = require('cqhttp');
const spawnSync = require('child_process').spawnSync;
const config = require("./config.json");

const bot = new CQHttp(config.launch);

function reply(data, rep) { 
	var send_data = {
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
	const code = parsed_msg[1];
	if (!code || !parseInt(code)) { 
		send_help(data);
		break;
	}
	const output = spawnSync("./ygopro", [code], {
		cwd: "./ygopro"
	});
	const result = output.stderr;
	if (!result || !result.length) {
		reply(data, "卡片 " + code + " 没有红字。");
	} else { 
		reply(data, "卡片 " + code + " 有红字，请尽快修复。\n"+result);
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

bot.listen(config.port, config.address);
