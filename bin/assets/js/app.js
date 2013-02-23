/*!
 * Mix.js application
 *
 * typeof code === 'hacky'
 *
 */

$(function(){
	// Create a new Mix instance 
	var m = window.m = Mix(),
	// Mix name
	mixName = '1901',
	// Define track name / sources
	//
	// Heads-up to anyone looking to use this code:
	//
	// Changing these values is basically all you have to do
	// to make this work with another mix.
	// Just make sure the audio files are in mono.
	//
	// Also: domain sharding is important!
	// Chrome will only download 6 resources simultaneously from the same origin.
	// So, serve your assets from multiple subdomains or your performance will suck.
	
	/*
	xsources = [
		{name: 'Kit_L', src: 'http://static1.kevincennis.com/sounds/1901_drumsleft.mp3'}
		,{name: 'Kit_R', src: 'http://static1.kevincennis.com/sounds/1901_drumsright.mp3'}
		,{name: 'Triggers', src: 'http://static1.kevincennis.com/sounds/1901_triggers.mp3'}
		,{name: 'Bass', src: 'http://static1.kevincennis.com/sounds/1901_bass.mp3'}
		,{name: 'Keys', src: 'http://static1.kevincennis.com/sounds/1901_keys.mp3'}
		,{name: 'Gtr_1', src: 'http://static1.kevincennis.com/sounds/1901_gtr1.mp3'}
		,{name: 'Gtr_2', src: 'http://static2.kevincennis.com/sounds/1901_gtr2.mp3'}
		,{name: 'Synth_1', src: 'http://static2.kevincennis.com/sounds/1901_synth1.mp3'}
		,{name: 'Synth_2', src: 'http://static2.kevincennis.com/sounds/1901_synth2.mp3'}
		,{name: 'Siren', src: 'http://static2.kevincennis.com/sounds/1901_siren.mp3'}
		,{name: 'Vox_FX', src: 'http://static2.kevincennis.com/sounds/1901_voxfx.mp3'}
		,{name: 'Ld_Vox', src: 'http://static2.kevincennis.com/sounds/1901_leadvox.mp3'}
	],
	*/
	
	
	sources = [
		{name: 'Kit_L', src: 'http://www/mixjs/bin/assets/sounds/1901_drumsleft.mp3'}
		,{name: 'Kit_R', src: 'http://www/mixjs/bin/assets/sounds/1901_drumsright.mp3'}
		,{name: 'Triggers', src: 'http://www/mixjs/bin/assets/sounds/1901_triggers.mp3'}
		,{name: 'Bass', src: 'http://www/mixjs/bin/assets/sounds/1901_bass.mp3'}
		/*
		,{name: 'Keys', src: 'http://www/mixjs/bin/assets/sounds/1901_keys.mp3'}
		,{name: 'Gtr_1', src: 'http://www/mixjs/bin/assets/sounds/1901_gtr1.mp3'}
		,{name: 'Gtr_2', src: 'http://www/mixjs/bin/assets/sounds/1901_gtr2.mp3'}
		,{name: 'Synth_1', src: 'http://www/mixjs/bin/assets/sounds/1901_synth1.mp3'}
		,{name: 'Synth_2', src: 'http://www/mixjs/bin/assets/sounds/1901_synth2.mp3'}
		,{name: 'Siren', src: 'http://www/mixjs/bin/assets/sounds/1901_siren.mp3'}
		,{name: 'Vox_FX', src: 'http://www/mixjs/bin/assets/sounds/1901_voxfx.mp3'}
		,{name: 'Ld_Vox', src: 'http://www/mixjs/bin/assets/sounds/1901_leadvox.mp3'}
		*/
	],
	
	sources = [
		{name: '100', src: 'http://www/mixjs/bin/assets/sounds/gaudete/100.mp3'}
		,{name: '110', src: 'http://www/mixjs/bin/assets/sounds/gaudete/110.mp3'}
		,{name: '120', src: 'http://www/mixjs/bin/assets/sounds/gaudete/120.mp3'}
		,{name: '130', src: 'http://www/mixjs/bin/assets/sounds/gaudete/130.mp3'}
		,{name: '200', src: 'http://www/mixjs/bin/assets/sounds/gaudete/200.mp3'}
		
		/*
		,{name: 'Keys', src: 'http://www/mixjs/bin/assets/sounds/1901_keys.mp3'}
		,{name: 'Gtr_1', src: 'http://www/mixjs/bin/assets/sounds/1901_gtr1.mp3'}
		,{name: 'Gtr_2', src: 'http://www/mixjs/bin/assets/sounds/1901_gtr2.mp3'}
		,{name: 'Synth_1', src: 'http://www/mixjs/bin/assets/sounds/1901_synth1.mp3'}
		,{name: 'Synth_2', src: 'http://www/mixjs/bin/assets/sounds/1901_synth2.mp3'}
		,{name: 'Siren', src: 'http://www/mixjs/bin/assets/sounds/1901_siren.mp3'}
		,{name: 'Vox_FX', src: 'http://www/mixjs/bin/assets/sounds/1901_voxfx.mp3'}
		,{name: 'Ld_Vox', src: 'http://www/mixjs/bin/assets/sounds/1901_leadvox.mp3'}
		*/
		
	],	
	
	
	
	
	// Utility method to rate-limit events
	debounce = function(func, wait) {
	    var timeout;
	    return function() {
            var context = this, args = arguments,
            later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
	    };
    },
    // Similar to debounce, but guarantees execution with a sustained barrage of events
    throttle = function( func, wait ){
	    var throttling = false;
	    return function(){
	        if ( !throttling ){
	            func.apply(this, arguments);
	            throttling = true;
	            setTimeout(function(){
	                throttling = false;
	            }, wait);            
	        }
	    }
	},
	// Default mix
	xdefaults = {
		"Kit_L":{"pan":-1,"left":0,"volume":0.44,"top":111}
		,"Kit_R":{"pan":1,"left":42,"volume":0.44,"top":111}
		,"Triggers":{"volume":0.66,"top":69,"pan":0,"left":22}
		,"Bass":{"volume":0.56,"top":88,"pan":0,"left":20}
		/*
		,"Gtr_1":{"pan":-0.38,"left":13,"volume":0.81,"top":38}
		,"Synth_1":{"volume":0.9,"top":20,"pan":0,"left":21}
		,"Keys":{"volume":0.88,"top":25,"pan":0,"left":21}
		,"Vox_FX":{"volume":0.23,"top":154,"pan":0,"left":20}
		,"Ld_Vox":{"volume":0.24,"top":152,"pan":0,"left":21}
		,"Gtr_2":{"volume":0.91,"top":18,"pan":0.19,"left":25}
		,"Siren":{"volume":0.44,"top":112,"pan":0.76,"left":37}
		,"Synth_2":{"volume":0.63,"top":74,"pan":0.1,"left":23}
		*/
	},
	
	defaults = {
		"100":{"pan":-1,"left":0,"volume":0.44,"top":111}
		,"110":{"pan":1,"left":42,"volume":0.44,"top":111}
		,"120":{"volume":0.66,"top":69,"pan":0,"left":22}
		,"130":{"volume":0.56,"top":88,"pan":0,"left":20}
		,"200":{"volume":0.56,"top":88,"pan":0,"left":20}
		/*
		,"Gtr_1":{"pan":-0.38,"left":13,"volume":0.81,"top":38}
		,"Synth_1":{"volume":0.9,"top":20,"pan":0,"left":21}
		,"Keys":{"volume":0.88,"top":25,"pan":0,"left":21}
		,"Vox_FX":{"volume":0.23,"top":154,"pan":0,"left":20}
		,"Ld_Vox":{"volume":0.24,"top":152,"pan":0,"left":21}
		,"Gtr_2":{"volume":0.91,"top":18,"pan":0.19,"left":25}
		,"Siren":{"volume":0.44,"top":112,"pan":0.76,"left":37}
		,"Synth_2":{"volume":0.63,"top":74,"pan":0.1,"left":23}
		*/
	},	
	
	//defaults = {}	
	
	// Deal with drag events
	dragHandler = (function(){
		var dragging = false, drag, dragPos, $elem, limit, constrain, track;
		$(window).bind('mouseup mousemove', function(e){
			if ( !dragging ) return;
			if ( e.type == 'mouseup' ){
				dragging = false;
				return;
			}
			var dist = constrain == 'y' ? e.pageY - drag : e.pageX - drag,
				pos = dragPos + dist <= 0 ? 0 : dragPos + dist >= limit ? limit : dragPos + dist,
				val = 1 - ( pos / limit );
			constrain == 'y' ? $elem.css('top', pos) : $elem.css('left', pos);
			drag = constrain == 'y' ? e.pageY : e.pageX;
			dragPos = pos;
			constrain == 'y' ? $elem.trigger('volume', [val]) : $elem.trigger('pan', [val]);
			constrain == 'y' ? storage(track, 'top', pos) : storage(track, 'left', pos);
		});
		return function( e, lim, axis ){
			constrain = axis || false;
			dragging = true;
			limit = lim;
			$elem = $(this);
			dragPos = axis == 'y' ? parseInt( $(this).css('top') ) : parseInt( $(this).css('left') );
			drag = axis == 'y' ? e.pageY : e.pageX;
			track = $(this).data('track');
		}
	}()),
	// Create Track instances, build DOM, bind events, use the most ridiculous jQuery chain of all time
	createTracks = function(){
		var name, fader, track;
		
		//alert(sources.length);
		
		for ( var i = 0, l = sources.length; i < l; i++ ){
			name = sources[i].name, fader,
		    track = m.createTrack(name, {source: sources[i].src});
			track.gain(0.5);
			fader = $(
				'<div id="fader_' + name + '" class="channel">' +
					'<div>' +
						'<div class="mute">M</div>' +
						'<div class="solo">S</div>' +
					'</div>' +
					'<div class="afl" data-track="' + name + '">PFL</div>' +
					'<div class="pan">' +
						'<div class="pan-track">' +
							'<div class="panner"></div>' +
						'</div>' +
					'</div>' +
					'<div class="track">' +
						'<div class="fader"></div>' +
						'<canvas width="10" height="100"></canvas>' +
					'</div>' +
					'<p class="label">' + name.replace('_', ' ') + '</p>' +
				'</div>')
			.appendTo('#mixer')
			.find('.fader')
			.data('track', name)
			.bind('mousedown', function(e){
				var height = parseInt( $(this).css('height') ),
					$parent = $(this).parents('.track'),
					parentHeight = parseInt( $parent.css('height') ),
					limitBottom = parentHeight - height;
				dragHandler.call($(this), e, limitBottom, 'y');
			})
			.bind('volume', function(e, val){
				var trackName = $(this).data('track'),
					track = m.getTrack(trackName);
				storage(trackName, 'volume', val);
				track.gain(val);
			})
			.end()
			.find('.panner')
			.data('track', name)
			.bind('mousedown', function(e){
				var width = parseInt( $(this).css('width') ),
					$parent = $(this).parents('.pan-track'),
					parentWidth = parseInt( $parent.css('width') ),
					limitRight = parentWidth - width;
				dragHandler.call($(this), e, limitRight, 'x');
			})
			.bind('pan', function(e, val){
				var pan = ( ( val * 100 ) - 50 ) / 50,
					trackName = $(this).data('track'),
					track = m.getTrack(trackName);
				storage(trackName, 'pan', -pan);
				track.pan( -pan );
			})
			.end();
			(function(track, fader){
				track.on('averagevolume', function(average){
					var canvas = fader.find('canvas')[0],
						context = canvas.getContext('2d'),
						height = canvas.height,
						width = canvas.width;
					average = -1 * average;
					context.fillStyle = '#0f0';
					context.clearRect(0, 0, width, height);
					context.fillRect(0, height, width, Math.round(average) );
				});
			}(track, fader));
		}
		fader = $(
			'<div id="fader_master" class="channel">' +
				'<div class="track">' +
					'<div class="fader"></div>' +
					'<canvas width="10" height="100"></canvas>' +
				'</div>' +
				'<p class="label">Master</p>' +
			'</div>')
		.appendTo('#mixer')
		.find('.fader')
		.data('track', 'Master')
		.bind('mousedown', function(e){
			var height = parseInt( $(this).css('height') ),
				$parent = $(this).parents('.track'),
				parentHeight = parseInt( $parent.css('height') ),
				limitBottom = parentHeight - height;
			dragHandler.call($(this), e, limitBottom, 'y');
		})
		.bind('volume', function(e, val){
			m.setGain(val * 1.5);
		});
	},
	// Values for volume/pan,
	mixValues = defaults,
	// Set storage values
	// Used to be localStorage instead of location.hash, but I wanted to be able to share mixes
	storage = function(track, prop, val){
		if ( track == 'Master' ) return;
		mixValues[track] = mixValues[track] || {};
		mixValues[track][prop] = Math.round( val * 100 ) / 100;
		updateHash();
	},
	
	// Read values from location.hash or use defaults to build the mix
	checkStorage = function(){
		/*
		var values;
		if ( window.location.hash ){
			try {
				mixValues = JSON.parse(window.location.hash.substr(1));
			}
			catch (err){
				window.location.hash = 'Oops';
			}
		} else if ( values = window.localStorage.getItem(mixName) ){
			mixValues = JSON.parse( values );
		}
		*/
		for ( var key in mixValues ){
			if ( mixValues[key].volume != undefined ) m.getTrack(key).gain(mixValues[key].volume);
			if ( mixValues[key].top != undefined ) $('#fader_' + key).find('.fader').animate({top: mixValues[key].top}, 200);
			if ( mixValues[key].left != undefined ) $('#fader_' + key).find('.panner').animate({left: mixValues[key].left}, 200);
			if ( mixValues[key].pan != undefined ) m.getTrack(key).pan(mixValues[key].pan);
		}
		//updateHash();
	},
	
	/*
	for ( var key in mixValues ){
		if ( mixValues[key].volume != undefined ) m.getTrack(key).gain(mixValues[key].volume);
		if ( mixValues[key].top != undefined ) $('#fader_' + key).find('.fader').animate({top: mixValues[key].top}, 200);
		if ( mixValues[key].left != undefined ) $('#fader_' + key).find('.panner').animate({left: mixValues[key].left}, 200);
		if ( mixValues[key].pan != undefined ) m.getTrack(key).pan(mixValues[key].pan);
	}
	*/
	
	// Update location.hash (rate-limited so I don't totally hose the UI thread stringifying JSON)
	// And, just for the hell of it, let's put it in localStorage too.
	updateHash = debounce(function(){
		/*
		var str = JSON.stringify(mixValues);
		window.location.hash = str;
		window.localStorage.setItem(mixName, str);
		*/
	}, 100),
	// # of tracks that have been loaded
	loaded = 0,
	// # of tracks that have been decoded
	decoded = 0,
	// Cache selector for logo-wrapper
	$logowrapper = $('#logo-wrapper'),
	// Cache selector for logo
	$logo = $('#logo'),
	// Native logo width
	logoWidth = parseInt( $logo.width(), 10 ),
	// Native height for logo
	logoHeight = parseInt( $logo.height(), 10 );
	// Start playback and build the mix when all tracks are decoded
	m.on('ready', function(){
		var $text = $('h3'), $progress = $('#progress-outer');
		checkStorage();
		m.setGain(1);
		// Audio tracks were cut up kinda sloppily. There's silence at the beginning. Skip ahead.
		m.seek(2.5);
		$text.add($progress).animate({opacity: 0}, 300)
		// Wait a couple seconds to show the controls message, then hide it because that shit's ugly
		setTimeout(function(){
			$text.text('Use your space bar to toggle playback')
				.animate({opacity: 1}, 300)
				.delay(7000)
				.animate({opacity: 0}, 300);
		}, 3000);
	});
	
	
	// Increment loaded var
	m.on('load', function(){
		loaded += 1;
		var total = m.tracks.length,
			$outer = $('#progress-outer'),
			$progress = $('#progress-inner'),
			width;
		width = Math.ceil( total / loaded * parseInt( $outer.width(), 10 ) );
		$progress.stop().animate({width: width}, 200 );
	});
	// Get total average gain
	m.on('averagevolume', throttle(function(){
	    var canvas = $('#fader_master').find('canvas')[0],
	    	context = canvas.getContext('2d'),
	    	height = canvas.height,
	    	width = canvas.width,
	    	$left = $('.needle.left'),
	    	$right = $('.needle.right')
	    	left = m.volumeleft,
	    	right = m.volumeright;
	    average = -1 * m.averagevolume;
	    context.fillStyle = '#0f0';
	    context.clearRect(0, 0, width, height);
	    context.fillRect(0, height, width, Math.round(average) );
	    $left.css('-webkit-transform', 'rotateZ(' + left + 'deg)');
	    $right.css('-webkit-transform', 'rotateZ(' + right + 'deg)');
	}, 5));
	// Mute and solo
	$('#mixer').delegate('.mute, .solo', 'click', function(){
		var type = $(this).hasClass('mute') ? 'mute' : 'solo',
			active = $(this).hasClass('active'),
			trackName = $(this).parents('.channel').find('.fader').data('track'),
			track = m.getTrack(trackName);
		switch (type){
			case 'mute':
				$(this).toggleClass('active');
				$(this).siblings().removeClass('active');
				if ( active ){
					track.unmute();
				} else {
					track.mute();
				}
				break;
			case 'solo':
				$(this).toggleClass('active');
				$(this).siblings().removeClass('active');
				if ( active ){
					track.unsolo();
				} else {
					track.solo();
				}
				break;
		}
	});
	// After Fader Listen or Pre Fader Listen -- Basically, "are the meters affected by the fader?"
	$('#mixer').delegate('.afl', 'click', function(){
		var trackName = $(this).data('track'),
			track = m.getTrack(trackName),
			active = $(this).hasClass('active');
		$(this).toggleClass('active')
		track.afl();
	});
	// Spacebar for play/pause
	$(window).bind('keydown', function(e){
		if ( e.keyCode != 32 || !m.ready ) return;
		!m.playing ? m.play() : m.pause();
	});
	// Let the images load before cloggin' up ur interweb tubez with AJAX requests for big MP3s
	$(window).bind('load', function(){
		createTracks();
	});
});