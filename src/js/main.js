try{
	window.__isCallMain__ = false;
	window.__howlerLoaded__ = [];
	window.__audioPlaylist__ = {
		"wind": {
			"filename": 'We_Share_This'
		},
		"fire": {
			"filename": 'Future_Gladiator'
		},
		"prayut": {
			"filename": 'lungtuu-sprites',
			"sprite": {
				"adjust": [0, 4000],
				"fireme": [5000, 6000],
				"die": [16000, 2000],
				"your_business": [18000, 3000],
				"enough": [21000, 1500]
			}
		}
	};
	


	function createHowlerObj(key){
		var howlObj = new Howl(Object.assign(
			window.__audioPlaylist__[key], {
				src: ['/audio/'+window.__audioPlaylist__[key].filename+'.mp3']
			}
		));
		return howlObj;
	};

	function loadAudioList(){
		for(var key in window.__audioPlaylist__){
			var howlObj = createHowlerObj(key);
			howlObj.on('load', (function(key, howlObj){
				return function(){
					audioLoaded(key, howlObj);
				}
			})(key, howlObj));
		}
	}

	function audioLoaded(key, howlerObj){
		window.__howlerLoaded__[key] = howlerObj;
		
		if(Object.keys(window.__howlerLoaded__).length === Object.keys(window.__audioPlaylist__).length){
			if(!window.__isCallMain__){
				window.__isCallMain__ = true;
				main();
			}
		}
	}

	window.addEventListener("pageshow", function() {
		loadAudioList();
	}, false);


	$(document).ready(function(){
		setTimeout(function(){
			loadAudioList();
		}, 15000);
	});

	function toggleBackground(from, to){
		if(!window.__howlerLoaded__[to].playing()){
			window.__howlerLoaded__[to].play();
			window.__howlerLoaded__[to].fade(0, 1, 500);
		}

		if(window.__howlerLoaded__[from].playing()){
			setTimeout(function(){
				window.__howlerLoaded__[from].pause();
				window.__howlerLoaded__[from].seek(0); 
			}, 500);
			window.__howlerLoaded__[from].fade(1, 0, 500);
		}
	}

	function main(){
		console.log("main")
		var hasGetValue = false,
			hasPrayutAdjust = false,
			hasPrayutEnough = false,
			lastMotorState = 0,
			lastMotorStatetime = null;

		setInterval(function(){
			$.getJSON('https://stupidhackth3-oldteam.itpcc.net/api.php?_='+(new Date()).getTime(), function(data){
				if(!(data.livejson && data.livejson[0]))
					return;
				var pmTimestamp = data.livejson[0]['0'];
				var pmValue = data.livejson[0]['2'];
				var motorState = parseInt(data.livejson[0]['3']);
				$("#pm-value").html(" "+pmValue+'µg/m<sup>3</sup>');
				$("#pm-timestamp").html(pmTimestamp);

				if(!hasGetValue){
					$(".loading-screen:visible").stop( true, false ).fadeOut().css("opacity", "0");
					hasGetValue = true;
				}

				// Let the show begin
				$('body').attr("data-motor-state", motorState);
				if(motorState == '1' || motorState == '2'){
					toggleBackground('fire', 'wind');
				}else{
					toggleBackground('wind', 'fire');
				}

				if(motorState !== lastMotorState){
					if(motorState === 3 && !hasPrayutAdjust){
						window.__howlerLoaded__['prayut'].play('adjust');
						hasPrayutAdjust = true;
					}else if(hasPrayutAdjust){
						hasPrayutAdjust = false;
					}

					if(motorState === 1 && lastMotorState === 4 && !hasPrayutEnough){
						window.__howlerLoaded__['prayut'].play('enough');
						hasPrayutEnough = true;
					}else if(hasPrayutEnough){
						hasPrayutEnough = false;
					}

					if(motorState === 3 || motorState === 4){
						lastMotorStateTime = new Date();
					}
				}

				if(
					(motorState === 3 || motorState === 4) && 
					!!lastMotorStateTime && 
					!hasPrayutEnough && 
					(new Date()).getTime() - lastMotorStateTime.getTime() > 5000
				){
					window.__howlerLoaded__['prayut'].play(
						Object.keys(window.__audioPlaylist__['prayut'].sprite)[(Math.floor((Math.random() * 3) + 0.5))]
					);
					lastMotorStateTime = new Date();
				}

				lastMotorState = motorState;
			});
		}, 1500);
		// window.__howlerLoaded__['prayut'].play('die');
	}
}catch(error) {
	alert("Error: " + error.message);
}