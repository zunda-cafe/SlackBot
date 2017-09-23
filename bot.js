//=========================================================
// Botの準備
//=========================================================
if (!process.env.token) {
    process.exit(1);
}
var Botkit = require('botkit');
var os = require('os');
var request = require('request');
var controller = Botkit.slackbot({debug: false,});
var bot = controller.spawn({token: process.env.token}).startRTM();

//=========================================================
// 基本的な受け答え
//=========================================================
//  [反応パターン一覧]
//    direct_message/direct_mention/mention/ambient
//    bot.reply()で、botに発言をさせます。
//=========================================================

controller.hears(['(.*)hello(.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
	bot.reply(message,'うるせぇ :anger:');
    });

controller.hears(['(.*)'], 'direct_message,direct_mention,mention', function (bot, message) {
	
	var hit_message = message.match[1].split(' ');

	if(hit_message[0] === '天気' && typeof hit_message[1] !== 'undefined'){ 
	    //bot.reply(message,hit_message[1]);
	}else{
	    bot.reply(message,'@botkun 天気 場所 で呼んでね (ex 天気 Tokyo) :+1:  ');
	    bot.reply(message,'場所のリストは http://openweathermap.org/help/city_list.txt を見てね  ');
	    return ;
	}

	var http = require('http');
	var wether_token = '7b5f78ec86963c40aa4fcc4c32b34fae';
	var city = hit_message[1];
	var response = '';
	var body = '';

	// ここから今の天気
	var base_url = 'http://api.openweathermap.org/data/2.5/weather?units=metric&q=';
	var weather_url = base_url + city + '&appid=' + wether_token;

	http.get(weather_url, function (result) {
		result.setEncoding('utf8');
		result.on('data', function(data) {
			body += data;

	           });
		result.on('end', function(data) {
			json_data = JSON.parse(body);
			if(json_data.cod === '404'){ 
			    bot.reply(message,'ゴメンね うまく探せなかったよ :dizzy_face: 都市名はあっているかな?');
			    return ;
			}

			var response_message = '今の天気は' + weather_convert (json_data.weather[0].main) +
			    ' (詳細 :' + weather_convert (json_data.weather[0].description) +
			    ')/ 気温は' + json_data.main.temp + '度 / 風速は' + json_data.wind.speed + 'm/s だよ';
			bot.reply(message,response_message);
		   });



	    });

	// ここから予報
	var base_url2 = 'http://api.openweathermap.org/data/2.5/forecast?units=metric&cnt=6&q=';
	var weather_url2 = base_url2 + city + '&appid=' + wether_token;
	var body2 = '';
	http.get(weather_url2, function (result) {
		result.setEncoding('utf8');
		result.on('data', function(data) {
			body2 += data;

	           });
		result.on('end', function(data) {
			var json_data2 = JSON.parse(body2);

			var rain1 = '0';
			if(typeof json_data2.list[3].rain['3h'] !== 'undefined'){
			    rain1 = json_data2.list[3].rain['3h'];
			} 
			
			var message2 = json_data2.list[3].dt_txt.slice(5,13).replace('-','月').replace(' ','日') +
			    '時の天気は' + weather_convert (json_data2.list[3].weather[0].main) + 
			    '(詳細:' + weather_convert (json_data2.list[3].weather[0].description) + 
			    ')/ 気温は' + json_data2.list[3].main.temp +
			    '度/ 風速は' + json_data2.list[3].wind.speed +
			    'm/s / 過去3時間の雨量は' + rain1 + 'だよ';
			bot.reply(message,message2);
			
			var rain2 = '0';
			if(typeof json_data2.list[4].rain['3h'] !== 'undefined'){
			    rain2 = json_data2.list[4].rain['3h'];
			} 
			var message3 = json_data2.list[4].dt_txt.slice(5,13).replace('-','月').replace(' ','日') +
			    '時の天気は' + weather_convert (json_data2.list[4].weather[0].main) +
			    '(詳細:' + weather_convert (json_data2.list[4].weather[0].description) +
			    ')/ 気温は' + json_data2.list[4].main.temp + 
			    '度/ 風速は' + json_data2.list[4].wind.speed +
			    'm/s / 過去3時間の雨量は' + rain2 + 'だよ';
			bot.reply(message,message3);
			var rain3 = '0';
			if(typeof json_data2.list[5].rain['3h'] !== 'undefined'){
			    rain3 = json_data2.list[5].rain['3h'];
			} 
			var message4 = json_data2.list[5].dt_txt.slice(5,13).replace('-','月').replace(' ','日') +
			    '時の天気は' + weather_convert (json_data2.list[5].weather[0].main) +
			    '(詳細:' + weather_convert (json_data2.list[5].weather[0].description) +
			    ')/ 気温は' + json_data2.list[5].main.temp +
			    '度/ 風速は' + json_data2.list[5].wind.speed +
			    'm/s / 過去3時間の雨量は' + rain3 + 'だよ';
			bot.reply(message,message4);
		    });
	    });
	bot.reply(message, '<@'+message.user + '> さん\n');
    });


function weather_convert (row_weather){
	var weathers = {
	    'clear sky' :'快晴 :sunny: ',
	    'few clouds':'晴れ :mostly_sunny: ',
	    //'scattered clouds':'曇り気味 :partly_sunny:',
	    //'broken clouds':'曇り :cloud:'
	    'clouds':'曇り :cloud: ',
	    'shower rain':'小雨 :droplet: ',
	    'rain':'雨 :umbrella: ',
	    'thunderstorm':'雷雨 :thunder_cloud_and_rain: ',
	    'snow':'雪 :snowman: ',
	    'mist':'霧 :fog:'
	}

	//return row_weather.toLowerCase();
	var result = weathers[row_weather.toLowerCase()];
	
	if(typeof result !== 'undefined'){
	    return result;	   
	}
	return row_weather;
}
 