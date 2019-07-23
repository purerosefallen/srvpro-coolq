const CQHttp = require('cqhttp');
const config = require("./config.json");

const bot = new CQHttp(config.launch);

function reply(data, rep) { 
	var send_data = {
		message: rep,
	};
	switch (data.message_type) { 
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
	}
	//bot("send_msg", send_data);
}

bot.on("message", (data) => { 
	if (!(data.group_id && config.allowed_ids.indexOf(data.group_id) != -1 || data.user_id && config.allowed_ids.indexOf(data.user_id) != -1))
		return;
	const msg = data.message;
	const parsed_msg = msg.split(" ");
	switch (parsed_msg[0]) { 
		case ":roomlist": { 
			var rep = "房间列表：\n";
			var count = 0;
			for (var room of ROOM_all) { 
				if (!room || !room.established) { 
					continue;
				}
				++count;
				rep += count + "\t" + room.name.split('$', 2)[0] + "\t"
				var player_slot = [];
				for (var player of room.get_playing_player()) { 
					player_slot[player.pos] = player;
				}
				if (room.hostinfo.mode === 2) {
					rep += (player_slot[0] ? player_slot[0].name : "???") + " & " + (player_slot[1] ? player_slot[1].name : "???") + " VS " + (player_slot[2] ? player_slot[2].name : "???") + " & " + (player_slot[3] ? player_slot[3].name : "???");
				} else { 
					rep += (player_slot[0] ? player_slot[0].name : "???") + " VS " + (player_slot[1] ? player_slot[1].name : "???");
				}
				rep += "\n"
			}
			reply(data, rep);
			break;
		}
	}
});

bot.listen(config.port, config.address);
