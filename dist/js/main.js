try{function createHowlerObj(e){return new Howl(Object.assign(window.__audioPlaylist__[e],{src:["/audio/"+window.__audioPlaylist__[e].filename+".mp3"]}))}function loadAudioList(){for(var e in window.__audioPlaylist__){var o=createHowlerObj(e);o.on("load",function(e,o){return function(){audioLoaded(e,o)}}(e,o))}}function audioLoaded(e,o){window.__howlerLoaded__[e]=o,Object.keys(window.__howlerLoaded__).length===Object.keys(window.__audioPlaylist__).length&&(window.__isCallMain__||(window.__isCallMain__=!0,main()))}function toggleBackground(e,o){window.__howlerLoaded__[o].playing()||(window.__howlerLoaded__[o].play(),window.__howlerLoaded__[o].fade(0,1,500)),window.__howlerLoaded__[e].playing()&&(setTimeout(function(){window.__howlerLoaded__[e].pause(),window.__howlerLoaded__[e].seek(0)},500),window.__howlerLoaded__[e].fade(1,0,500))}function main(){console.log("main");var t=!1,n=!1,_=!1,d=0;setInterval(function(){$.getJSON("https://stupidhackth3-oldteam.itpcc.net/api.php?_="+(new Date).getTime(),function(e){if(e.livejson&&e.livejson[0]){var o=e.livejson[0][0],i=e.livejson[0][2],a=parseInt(e.livejson[0][3]);$("#pm-value").html(" "+i+"µg/m<sup>3</sup>"),$("#pm-timestamp").html(o),t||($(".loading-screen:visible").stop(!0,!1).fadeOut().css("opacity","0"),t=!0),$("body").attr("data-motor-state",a),"1"==a||"2"==a?toggleBackground("fire","wind"):toggleBackground("wind","fire"),a!==d&&(3!==a||n?n&&(n=!1):(window.__howlerLoaded__.prayut.play("adjust"),n=!0),1!==a||4!==d||_?_&&(_=!1):(window.__howlerLoaded__.prayut.play("enough"),_=!0),3!==a&&4!==a||(lastMotorStateTime=new Date)),(3===a||4===a)&&lastMotorStateTime&&!_&&5e3<(new Date).getTime()-lastMotorStateTime.getTime()&&(window.__howlerLoaded__.prayut.play(Object.keys(window.__audioPlaylist__.prayut.sprite)[Math.floor(3*Math.random()+.5)]),lastMotorStateTime=new Date),d=a}})},1500)}window.__isCallMain__=!1,window.__howlerLoaded__=[],window.__audioPlaylist__={wind:{filename:"We_Share_This"},fire:{filename:"Future_Gladiator"},prayut:{filename:"lungtuu-sprites",sprite:{adjust:[0,4e3],fireme:[5e3,6e3],die:[16e3,2e3],your_business:[18e3,3e3],enough:[21e3,1500]}}},window.addEventListener("pageshow",function(){loadAudioList()},!1),$(document).ready(function(){setTimeout(function(){loadAudioList()},15e3)})}catch(e){alert("Error: "+e.message)}