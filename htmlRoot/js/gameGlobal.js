const game = {
	seizures: {},
	stats: {},
	
	_app: null,
	_gameplaySz: null,
	
	musicManager: {
		_melody: 'battle',
		
		addCheckBox(world) {
			const app = game._app;
			const melody = 'coin';
			const position = new QQ.Point(-7, -3);
			const checkBox = new QQ.CheckBox({
				app: app,
				size: new QQ.Size(2, 2),
				anchor: new QQ.Point(1, 0.5),
				position: position,
				isChecked: game.settingMusic(),
				onChange: (isChecked) => {
					if ( game.settingMusic(isChecked) ) {
						app.controlSound(this._melody, {loop: true, play: true});
					} else {
						app.controlSound(this._melody, {pause: true});
					}
				}
			});
			world.addSubject(checkBox);
			world.addSubject(new QQ.StyledText(
				'Music', 'default', 'checkboxText', {
					position: new QQ.Point(position.x() + 1, position.y()),
					onClick: () => {checkBox.change();}
				}
			));
		},
		
		start() {
			if ( game.settingMusic() ) {
				game._app.controlSound(this._melody, {loop: true, play: true});
			}
		}
		
	},
	
	playSound(sound) {
		if ( game.settingSound() ) {
			this._app.playSound(sound);
		}
	},
	
	initGameTickType() {
		if ( this._gameplaySz ) {
			const world = this._gameplaySz.getWorld();
			const targetFps = this.getNumberFromStorage('Setting targetFps');
			if ( targetFps === 0 ) {
				world.setTickType('var');
			} else {
				world.setTickType('const');
				world.setTickTimeStep(1/targetFps);
			}
		}
	},
	
	getGameSettingFpsText() {
		let text = this.getNumberFromStorage('Setting targetFps');
		if ( text === 0 ) {
			text = 'max';
		}
		return 'Ticks ' + text;
	},
	
	getGameSettingWidth() {
		let text = this.getNumberFromStorage('Setting viewportWidth', 600);
		return 'Width ' + text;
	},
	
	initGameViewport() {
		const width = this.getNumberFromStorage('Setting viewportWidth', 600);
		var vp = document.getElementById('viewport');
		vp.setAttribute('content','width=' + width + ', user-scalable=no');
	},
	
	setGameplaySz(sz) {
		this._gameplaySz = sz;
	},
	
	setApp(app) {
		this._app = app;
	},
	
	storage(...args) {
		return this._app.storage(...args);
	},
	
	settingMusic(value) {
		const text = 'Setting music';
		if ( value !== undefined ) {
			this.storage(text, value);
		}
		return this.getBoolFromStorage(text, false);
	},
	
	settingSound(value) {
		const text = 'Setting sound';
		if ( value !== undefined ) {
			this.storage(text, value);
		}
		return this.getBoolFromStorage(text, true);
	},
	
	getBoolFromStorage(text, init = false) {
		let n = this.storage(text);
		if ( n === null ) {
			this.storage(text, init);
			n = this.storage(text);
		}
		return n === 'true';
	},
	
	getNumberFromStorage(text, init = 0) {
		let n = this.storage(text);
		if ( n === null ) {
			this.storage(text, init);
			n = init;
		}
		return Number(n);
	},
	
	getAvailableLevel() {
		let storageLevel = this._app.storage('Available level');
		if ( storageLevel === null ) {
			storageLevel = 1;
			this._app.storage('Available level', storageLevel);
		}
		return Number(storageLevel);
	},
	
	winLevel(level) {
		const availableLevel = game.getAvailableLevel();
		if ( level === availableLevel ) {
			this._app.storage('Available level', availableLevel+1);
		}
	},
	
	getLevelRandom(a, b, level, options = {}) {
		const cap = QQ.default(options.cap, true);
		const maxLevel = QQ.default(options.maxLevel, 100);
		const coverage = QQ.default(options.coverage, 75);
		const lvlPercent = level/maxLevel;
		const round = QQ.default(options.round, false);
		
		const diff = Math.abs(b-a);
		const interval = (diff/100) * coverage * Math.random();
		const rnd = QQ.Math.rand(0, interval, false) - interval/2;

		let center;
		if ( a < b ) {
			center = a + diff*lvlPercent;
		} else {
			center = a - diff*lvlPercent;
		}
		
		let result = center + rnd;
		
		if ( a < b ) {
			if ( result < a ) {
				result = a;
			}
			if ( result > b && cap ) {
				result = b;
			}
		} else {
			if ( result < b && cap ) {
				result = b;
			}
			if ( result > a  ) {
				result = a;
			}
		}
		if ( round ) {
			result = Math.round(result);
		}
		return result;
	},
	
	limitedRandom(a, b, level) {
		return game.getLevelRandom(
			a, b, Math.min(100, level),
			{maxLevel: 200, coverage: 100}
		);
	},
	
	getCoins() {
		let coins = this._app.storage('Coins');
		if ( coins === null ) {
			this._app.storage('Coins', 0);
			coins = 0;
		}
		return Number(coins);
	},
	
	addCoins(n) {
		let coins = this.getCoins();
		coins += n;
		this._app.storage('Coins', coins);
	},
	
	subCoins(n) {
		let coins = this.getCoins();
		coins -= n;
		if ( coins < 0 ) {
			return false;
		}
		this._app.storage('Coins', coins);
		return true;
	},
	
	mergeBones(bones) {
		// Will be redefined
	},
	
	reset() {
			this._app.storage('Available level', 1);
			this._app.storage('Bow arrows', 1);
			this._app.storage('Bow coolDown', 1);
			this._app.storage('Bow penetration', 1);
			this._app.storage('Bow shield', 2);
			this._app.storage('Bow speed', 0);
			this._app.storage('Coins', 0);
	}
	
};
