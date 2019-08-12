"use strict";
const sqlite3 = require('sqlite3').verbose();

this.ALL_CARD_DATAS = {};

this.load = (filename) => { 
	var db = new sqlite3.Database(filename);
	var load_count = 0;
	var _this = this;
	db.each("select * from datas,texts where datas.id=texts.id", function (err,result) {
		if (err) {
			console.log(config.dbfile + ":" + err);
			return;
		}
		else {
			++load_count;
			if (result.type & ygopro.constants.TYPES.TYPE_MONSTER) {
				if (result.level <= 12) {
					result.LScale = 0;
					result.RScale = 0;
				}
				else { //转化为16位，0x01010004，前2位是左刻度，2-4是右刻度，末2位是等级
					const levelHex=parseInt(result.level, 10).toString(16);
					result.level=parseInt(levelHex.slice(-2), 16);
					result.LScale=parseInt(levelHex.slice(-8,-6), 16);
					result.RScale=parseInt(levelHex.slice(-6,-4), 16);
				}
			}
			
			_this.ALL_CARD_DATAS[result.id] = result;
		}
	}, () => { 
			log.info("srvpro-coolq:", load_count + " card(s) loaded from " + filename);
	});
}

this.query_card = (info) => { 
	if (!info)
		return null;
	const parsed_info = parseInt(info);
	if (this.ALL_CARD_DATAS[info]) {
		return this.ALL_CARD_DATAS[info];
	} else if (parsed_info && this.ALL_CARD_DATAS[parsed_info]) {
		return this.ALL_CARD_DATAS[parsed_info];
	} else if (typeof (info) === "string") {
		for (var k in this.ALL_CARD_DATAS) { 
			const card = this.ALL_CARD_DATAS[k]
			if (card && card.name === info) {
				return card;
			}
		}
	}
	return null;
}

this.format_name_and_code = (card) => { 
	if (!card) { 
		return "";
	}
	return card.nthis.format_name_and_codeame + "(" + card.id + ")";
}

this.format_all = (card) => { 
	var ret = this.format_name_and_code(card) + "\n";
	if (result.type & ygopro.constants.TYPES.TYPE_MONSTER) {
		if (result.level <= 12) {
			result.LScale = 0;
			result.RScale = 0;
		}
		else { //转化为16位，0x01010004，前2位是左刻度，2-4是右刻度，末2位是等级
			const levelHex = parseInt(result.level, 10).toString(16);
			result.level = parseInt(levelHex.slice(-2), 16);
			result.LScale = parseInt(levelHex.slice(-8, -6), 16);
			result.RScale = parseInt(levelHex.slice(-6, -4), 16);
		}
	} else { 
		
	}
	ret += "\n";
	ret += card.desc;
	return ret;
}
