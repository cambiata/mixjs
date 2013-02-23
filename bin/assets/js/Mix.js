/*!
 * Mix.js
 *
 * A Web Audio library for mixing multitrack audio 
 *
 * Copyright 2012 Kevin Ennis
 * kevincennis.com
 * kennis84 [at] gmail [dot] com
 * MIT licensed
 *
 * The comments are pretty sparse... 
 * But if you're interested in using the code, 
 * send me an email and it might prompt me to finally put this up on GitHub.
 */

;(function(window, undefined){

	var Mix, Track, debounce, on, off, trigger, solo, unsolo, log10, body;
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Just a reference to the body element
	body = document.getElementsByTagName('body')[0];
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~~
	// Utility function to rate-limit events
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
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Utility function for binding events
	on = function( type, callback ){
		this.events[type] = this.events[type] || [];
		this.events[type].push( callback );
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Utility function for removing all events of a given type
	off = function( type ){
		this.events[type] = [];
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Utility function for trigger events
	trigger = function( type ){
		if ( !this.events[type] ) return;
		var args = Array.prototype.slice.call(arguments, 1);
		for (var i = 0, l = this.events[type].length; i < l;  i++)
			if ( typeof this.events[type][i] == 'function' ) 
				this.events[type][i].apply(this, args);
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Private function for dealing with solo and mute events within a Mix instance
	soloMute = function(){
		var total = this.tracks.length,
			soloed = this.soloed;
		for ( var i = 0; i < total; i++ ){
			var self = this.tracks[i];
			// Perform new mutes
			if ( self.get('muted') && !self.get('_muted') ) {
				self.set('gainCache', self.gain());
				self.set('_muted', true);
				self.gain(0, true);
			}
			if ( soloed > 0 ){
				if ( self.get('soloed') ){
					self.gain(self.get('gainCache'), true);
					self.set('_muted', false);
				} else if ( !self.get('_muted') ) {
					self.set('gainCache', self.gain());
					self.gain(0, true);
					self.set('_muted', true);
				}
			} else {
				// Unmute
				if ( !self.get('muted') ){
					self.set('_muted', false);
					self.gain(self.get('gainCache'), true);
				}
			}
		}
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Base 10 log function
	log10 = function( val ){
		return Math.log(val) / Math.log(10);
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// The Mix constructor
	Mix = function(opts){
		var defaults = {};
		if ( !(this instanceof Mix) ) return new Mix(opts);
		this.options = this.extend(defaults, opts || {});
		this.tracks = [];
		this.lookup = {};
		this.events = {};
		this.soloed = 0;
		this.ready = false;
		this.playing = false;
		this.progress = 0;
		this.averagevolume = 0;
		this.volumeleft = 0;
		this.volumeright = 0;
		this.gain = 1;
		this._meterCount = 0;
		this.loaded = 0;
		if ( typeof AudioContext === 'function' ) 
			this.context = new AudioContext();
		else 
			this.context = new webkitAudioContext();
		// Check ready state
		this.on('load', function(){
			var total = this.tracks.length;
			this.loaded += 1;
			if ( total == this.loaded ){
				this.ready = true;
				this.trigger('ready');
			}
		});
		this.on('averagevolume', function(){
			var total = this.tracks.length,
				left = 0,
				right = 0,
				totalvolume = 0,
				vol, pan, panleft, panright;
			this._meterCount++;
			// Cheap way to make sure this gets fired less frequently
			if ( this._meterCount > total ) this._meterCount = 0;
			if ( !this._meterCount == total ) return;
			for ( var i = 0; i < total; i++ ){
				vol = this.tracks[i].get('averagevolume') || 0;
				pan = this.tracks[i].pan();
				panleft = ( 1 - pan ) / 2;
				panright = ( 1 + pan ) / 2;
				totalvolume += Math.pow( 10, vol / 10 );
				left += Math.pow( 10, ( vol * panleft ) / 10 );
				right += Math.pow( 10, ( vol * panright) / 10 );
			}
			this.averagevolume = 10 * log10( totalvolume );
			this.volumeleft = 10 * log10( left );
			this.volumeright = 10 * log10( right );
		});
		this.on('soloMute', function(){
			soloMute.apply(this, arguments)
		});
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Utility method for extending objects (arguments should be passed in the order of lowest priority)
	Mix.prototype.extend = function(){
		var output = {}, args = arguments, l = args.length;
		for ( var i = 0; i < l; i++ )		
			for ( var key in args[i] )
				if ( args[i].hasOwnProperty(key) )
					output[key] = args[i][key];
		return output;
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Bind events to a Mix instance
	Mix.prototype.on = function(){
		on.apply(this, arguments);
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Unind all events of a given type from a Track instance
	Mix.prototype.off = function(){
		off.apply(this, arguments);
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Trigger events on a Track instance
	Mix.prototype.trigger = function(){
		trigger.apply(this, arguments);
	}
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Create a new Track instance and add it to the mix
	Mix.prototype.createTrack = function(name, opts){
		if ( !name || this.lookup[name] ) return;
		var track = new Track(name, opts, this);
		this.tracks.push( track );
		this.lookup[name] = track;
		return track;
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Return a Track instance by name
	Mix.prototype.getTrack = function(name){
		return this.lookup[name];
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Remove a new Track instance from the mix
	Mix.prototype.removeTrack = function(name){
		var rest, arr = this.tracks, total = arr.length;
		for ( var i = 0; i < total; i++ ){
			if ( arr[i].name == name ){
				rest = arr.slice(i + 1 || total);
				arr.length = i < 0 ? total + i : i;
				arr.push.apply( arr, rest );
			}
		}
		delete this.lookup[name];
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Play all loaded Track instances
	Mix.prototype.play = function(){
		var total = this.tracks.length;
		this.playing = true;
		for ( var i = 0; i < total; i++ )
			if ( this.tracks[i].ready ) this.tracks[i].play();
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Rewind all loaded Track instances
	Mix.prototype.rewind = function(){
		var total = this.tracks.length;
		for ( var i = 0; i < total; i++ )
			if ( this.tracks[i].ready ) this.tracks[i].rewind();
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Seek to a specific time
	Mix.prototype.seek = function( time ){
		var total = this.tracks.length, ready = 0, self = this, check;
		check = function(){
		    ready += 1;
		    if ( ready === total ) self.play();
		};
		if ( typeof time === 'undefined' ) return;
		this.pause();
		for ( var i = 0; i < total; i++ )
		    self.tracks[i].seek( time, check );
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Pause all loaded Track instances
	Mix.prototype.pause = function(){
		var total = this.tracks.length;
		this.playing = false;
		for ( var i = 0; i < total; i++ )
			if ( this.tracks[i].ready ) this.tracks[i].pause();
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Set Master gain
	Mix.prototype.setGain = function( gain ){
		var total = this.tracks.length;
		this.gain = gain;
		for ( var i = 0; i < total; i++ )
			this.tracks[i].gain( this.tracks[i].gain() );
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// The Track constructor
	Track = function(name, opts, mix){
		var self = this,
			defaults = {
				gain: 1,
				pan: 1
			};
		this.options = Mix.prototype.extend.call(this, defaults, opts || {});
		this.name = name;
		this.events = {};
		this.ready = false;
		this.set('mix', mix);
		this.set('muted', false);
		this.set('soloed', false);
		this.set('afl', true);
		this.set('currentTime', 0);
		this.set('gainNode', this.get('mix').context.createGainNode());
		this.set('panner', this.get('mix').context.createPanner());
		this.get('panner').panningModel = webkitAudioPannerNode.EQUALPOWER;
		this.get('panner').setPosition(0,0,.1);
		this.set('analyser', this.get('mix').context.createAnalyser());
		this.get('analyser').smoothingTimeConstant = 0.3;
		this.get('analyser').fftSize = 128;
		this.set('processor', this.get('mix').context.createJavaScriptNode(2048, 1, 1));
		this.set('gainCache', this.gain());
		this.set('freqByteData', new Uint8Array(this.get('analyser').frequencyBinCount));
		this.get('processor').onaudioprocess = function(){
			self.gainMeter();
		}
		if ( this.get('source') ) this.load( this.get('source'));
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Connect the Track instance's audio context to a buffer source
	Track.prototype.load = function( source ){
		var self = this;
		self.set('element', document.createElement('audio'));
		self.get('element').src = source;
		self.get('element').addEventListener('canplaythrough', function(){
			self.set('source', self.get('mix').context.createMediaElementSource(self.get('element')));
			self.get('source').connect(self.get('panner'));
			self.get('panner').connect(self.get('gainNode'));
			self.get('gainNode').connect(self.get('mix').context.destination);
			self.get('source').connect(self.get('analyser'));
			self.get('analyser').connect(self.get('processor'));
			self.get('processor').connect(self.get('source').context.destination);
		    self.trigger('load');
			self.ready = true;
			self.get('mix').trigger('load', self);
		}, false);
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Calculate the average gain for a Track instance in realtime
	Track.prototype.gainMeter = function(){
		var values = 0, average, length = this.get('freqByteData').length;
		this.get('analyser').getByteFrequencyData(this.get('freqByteData'));
		for ( var i = 0; i < length; i++ ){
			values += this.get('freqByteData')[i];
		}
		average = values / length;
		if ( this.get('afl') ) average = average * this.gain() * this.get('mix').gain;
		this.set('averagevolume', average);
		this.get('mix').trigger('averagevolume', self);
		this.trigger('averagevolume', average);
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Begin playback on a Track instance
	Track.prototype.play = function(){
		if ( !this.ready ){
			this.on('load', function(){
				this.play();
			});
			return;
		}
		if ( this.options.playing ) return;
		this.options.source.mediaElement.play();
		this.options.playing = true;
		this.trigger('play');
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Rewind a Track instance
	Track.prototype.rewind = function(){
		this.options.source.mediaElement.currentTime = 0;
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Seek a Track instance
	Track.prototype.seek = function( time, callback ){
		var self = this, listener;
        listener = function(){
            callback();
            self.options.source.mediaElement.removeEventListener('seeked', listener, false);
        };
        this.options.source.mediaElement.addEventListener('seeked', listener, false);
		this.options.source.mediaElement.currentTime = time;
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Pause a Track instance
	Track.prototype.pause = function(){
		this.options.source.mediaElement.pause();
		this.options.playing = false;
		this.trigger('pause');
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Bind events to a Track instance
	Track.prototype.on = function(){
		on.apply(this, arguments);
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Unind all events of a given type from a Track instance
	Track.prototype.off = function(){
		off.apply(this, arguments);
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Trigger events on a Track instance
	Track.prototype.trigger = function(){
		trigger.apply(this, arguments);
	}
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Return a property value for a Track instance
	Track.prototype.get = function(prop){
		return this.options[prop];
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Set a property value for a Track instance
	Track.prototype.set = function(prop, val){
		if ( typeof val === 'undefined' ) return;
		this.options[prop] = val;
		return this.options[prop];
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Return a reference to the Track instance's parent Mix (no setter)
	Track.prototype.mix = function(){
		return this.get('mix');
	}
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Get or set the gain on a Track instance (0 - 1)
	Track.prototype.gain = function(val, override){
		var min = 0, max = 1, master = this.get('mix').gain;
		if ( typeof val !== 'undefined' && val >= min && val <= max ){
			this.set('gain', val);
			if ( !override ) this.set('gainCache', val);
			if ( !this.get('_muted') || override ) this.get('gainNode').gain.value = val * master;
		}
		return this.get('gain') || this.get('gainNode').gain.value;
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Get or set the pan position on a Track instance (-1 - 1, left to right)
	Track.prototype.pan = function(val){
		if ( typeof val !== 'undefined' ) 
			this.get('panner').setPosition(val, 0, .1);
		this.set('pan', val)
		return this.get('pan') || 0;
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Mute an instance of Track
	Track.prototype.mute = function(){
		if ( this.get('soloed') ) this.unsolo();
		this.set('muted', true);
		this.trigger('mute');
		this.get('mix').trigger('soloMute', this);
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Unmute an instance of Track
	Track.prototype.unmute = function(){
		this.set('muted', false);
		this.trigger('unmute');
		this.get('mix').trigger('soloMute', this);
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Solo an instance of Track
	Track.prototype.solo = function(){
		if ( this.get('muted') ) this.unmute();
		this.set('soloed', true);
		this.get('mix').soloed += 1;
		this.trigger('solo');
		this.get('mix').trigger('soloMute', this);
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Unsolo an instance of Track
	Track.prototype.unsolo = function(){
		this.set('soloed', false);
		this.get('mix').soloed -= 1;
		this.trigger('unsolo');
		this.get('mix').trigger('soloMute', this);
	};
	
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Toggle AFL
	Track.prototype.afl = function(){
		this.get('afl') ? this.set('afl', false) : this.set('afl', true);
	};
		
	//~~~~~~~~~~~~~~~~~~~~~~~~~
	// Expose the Mix constructor
	window.Mix = Mix;
	
}(window));