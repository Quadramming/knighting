class HeartsContainer extends QQ.Container {
	
	constructor(options) {
		options.isSortOnAdd = false;
		options.isSortOnTick = false;
		super(options);
	}
	
};

class ArrowsContainer extends QQ.Container {
	
	constructor(options) {
		options.isSortOnAdd = false;
		options.isSortOnTick = false;
		super(options);
	}
	
};

class ArrowsGrave extends QQ.Container {

	constructor(options) {
		options.isSortOnAdd = false;
		options.isSortOnTick = false;
		super(options);
	}

};

game.seizures.Gameplay = class Gameplay
	extends QQ.Seizures.Base
{
	
	constructor(input) {
		input.isPauseable = true;
		input.maxTicks = 1; // 7 ???
		super(input);
		this._castle = null;
		this._player = null;
		this._changePatrolDirection = null;
		this._battleField = null;
		this._enemyManager = null;
		this._currentLevel = 1;
		this._bonesCanvas = null;
		this._grassCanvas = null;
		this._onResize = null;
		this.setCamera();
		this.initWorld();
		this.initStats();
		game.setGameplaySz(this);
		game.initGameTickType();
		game.musicManager.start();
	}
	
	initStats() {
		game.stats.arrows = new StatArrows({app: this._app});
		game.stats.coolDown = new StatCoolDown({app: this._app});
		game.stats.penetration = new StatPenetration({app: this._app});
		game.stats.speed = new StatSpeed({app: this._app});
		game.stats.shield = new StatShield({app: this._app});
	}
	
	initWorld() {
		this._world.clearStage();
		this.setGrass();
		this._castle = this.createCastle();
		this._world.addSubject(this._castle);
		this._world.addSubject(new HeartsContainer({
			z: 20
		}));
		this._world.addSubject(new ArrowsContainer({
			z: 5
		}));
		this._world.addSubject(new ArrowsGrave({
			z: 2
		}));
	}
	
	addLevelShowOff() {
		const text = new QQ.StyledActionableText(
			this._currentLevel, 'levelShowoff'
		);
		text.setAction(
			new QQ.Actions.Disappear({
				duration: 1,
				onEnd: function() {
					this._subj.deleteMe();
				}
			})
		);
		this._world.addSubject(text);
	}
	
	startGame(level = game.getAvailableLevel()) {
		this._currentLevel = level;
		this.initWorld();
		this.setPlayer();
		this.setBattleField();
		this.setChangePatrolDirection();
		this.setEnemyManager(level);
		this.setBonesMerge();
		//this.setBonesCanvas();
		this._setHud('GameHud', {parent: this});
		this.addLevelShowOff();
	}

	getCurrentLevel() {
		return this._currentLevel;
	}
	
	showMenu() {
		this._app.setSz('Menu', {}, true);
	}
	
	setPlayer() {
		this._player = new Player({
			world: this._world,
			app: this._app,
			position: new QQ.Point(0, 0),
			anchor: new QQ.Point(0.5, 0.5),
			level: this._currentLevel,
			z: 1
		});
		this._castle.addSubject(this._player);
	}
	
	setBonesMerge() {
		game.mergeBones = (bones) => {
			this._grassCanvas.merge(bones);
		};
	}
	
	setBonesCanvas() {
		this._bonesCanvas = new BonesCanvas({
			app: this._app,
			camera: this._camera,
			z: 2
		});
		game.mergeBones = (bones) => {
			this._bonesCanvas.merge(bones);
		};
		this._world.addSubject(this._bonesCanvas);
	}
	
	setGrass() {
		if ( this._grassCanvas ) {
			this._grassCanvas.release();
		}
		this._grassCanvas = new GrassCanvas({
			app: this._app,
			camera: this._camera,
			z: 2
		});
		this._world.addSubject(this._grassCanvas);
	}
	
	setEnemyManager(level) {
		this._enemyManager = new EnemyManager({
			level: level,
			player: this._player,
			world: this._world
		});
		this._world.addSubject(this._enemyManager);
	}
	
	setChangePatrolDirection() {
		this._changePatrolDirection = new ChangePatrolDirection({
			player: this._player
		});
		this._world.addSubject(this._changePatrolDirection);
	}
	
	setBattleField() {
		this._battleField = new BattleField({
			player: this._player,
			worldPointer: this._input
		});
		this._world.addSubject(this._battleField);
	}
	
	init() {
		super.init();
		game.getArrowsPool().reset();
		this._app.setSz('Menu', {}, true);
	}
	
	release() {
		super.release();
		game.getArrowsPool().clean();
		game.mergeBones = null;
		this._castle = null;
		this._player = null;
		this._changePatrolDirection = null;
		this._battleField = null;
		this._enemyManager = null;
		this._currentLevel = 1;
		this._bonesCanvas = null;
		this._grassCanvas.release();
		this._grassCanvas = null;
		window.removeEventListener('resize', this._onResize);
		this._onResize = null;
	}
	
	getHero() {
		return this._player;
	}
	
	setCamera() {
		const size = new QQ.Point(30, 53);
		const eye = new QQ.Point(0, -7);
		this._camera.init(size, eye);
		this._onResize = () => {
			const cameraSize = this._camera.getViewSize();
			this._camera.setPosition(new QQ.Point(
				eye.x(),
				eye.y() -(cameraSize.h()-size.h())/2
			));
		};
		this._onResize();
		window.addEventListener('resize', this._onResize);
	}
	
	createCastle() {
		const castle = new QQ.Container({
			position: new QQ.Point(0, -30),
			z: 2
		});
		castle.addSubject(QQ.Subject.make({
			app: this._app,
			img: 'castleEdge',
			position: new QQ.Point(0, 3),
			size: new QQ.Size(37.5, 1.5),
			anchor: new QQ.Point(0.5, 1),
			z: 2
		}));
		return castle;
	}
	
	tick(delta) {
		this.sortEnemys();
		super.tick(delta);
	}
	
	sortEnemys() {
		let enemys = this._world.getSubjects((subj) => {
			return subj instanceof Enemy;
		});
		for ( const enemy of enemys ) {
			enemy.setZ(enemy.getPosition().y());
		}
	}
	
	onBackButton() {
		this._app.pause();
	}
	
};

QQ.Seizures.register.set('Gameplay', game.seizures.Gameplay);
