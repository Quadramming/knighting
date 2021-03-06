class Arrow extends
		QQ.mixins(QQ.Subject.ActionableMix, QQ.Subject.Base)
{
	
	constructor(options = {}) {
		Arrow.fixOptions(options);
		super(options);
		this._alpha = undefined;
		this._timeFixed = undefined;
		this._timePerMeter = undefined;
		this._penetration = undefined;
		this.initialize(options, false);
		Arrow.prototype.initialize.call(this, options, false);
		// Init global arrow picture
		if ( ! Arrow.picture ) {
			this._initPicture(2);
		}
	}
	
	initialize(options, initializeSuper = true) {
		if ( initializeSuper ) {
			Arrow.fixOptions(options);
			super.initialize(options);
		}
		this._alpha = 1;
		this._timeFixed = options.timeFixed;
		this._timePerMeter = options.timePerMeter;
		this._penetration = options.penetration;
	}
	
	static fixOptions(options) {
		options.isClickable = false;
		options.anchor = new QQ.Point(0.5, 1);
		options.size = new QQ.Size(0.75, 3);
	}
	
	deleteMe() {
		super.deleteMe();
		game.getArrowsPool().release(this);
	}
	
	_initPicture(scale = 1) {
		const cvs = this._app.getImgCanvas('arrow');
		const picSize = new QQ.Size(
			cvs.size.x() * scale,
			cvs.size.y() * scale
		);
		const picCanvas = QQ.makeCanvas(picSize);
		const data = picCanvas.ctx.createImageData(picSize.w(), picSize.h());
		this._putImage(data, scale);
		picCanvas.ctx.putImageData(data, 0, 0);
		Arrow.picture = new QQ.Sprite(picCanvas.cvs);
		Arrow.picture.setAnchor(this._anchor);
	}
	
	_putImage(data, scale) {
		const floor = Math.floor;
		const pixels = data.data;
		const size = new QQ.Size(data.width, data.height);
		const cvs = this._app.getImgCanvas('arrow');
		const picSize = cvs.size;
		const picPixels = cvs.getPixels();
		for ( let y = 0; y < size.y(); ++y ) {
			for ( let x = 0; x < size.x(); ++x ) {
				const index = (y*size.w()+x)*4;
				const pixel = QQ.getPixel(
					picPixels,
					cvs.size,
					new QQ.Point(
						floor(x/scale),
						floor(y/scale)
					)
				);
				if ( pixel.a === 0xFF ) {
					pixels[index+0] = pixel.r;
					pixels[index+1] = pixel.g;
					pixels[index+2] = pixel.b;
					pixels[index+3] = pixel.a;
				}
			}
		}
	}
	
	setAlpha(a) {
		this._alpha = a;
	}
	
	draw(ctx) {
		ctx.transform(this.getMatrix());
		Arrow.picture.setAlpha(this._alpha);
		Arrow.picture.setSize(this._size);
		Arrow.picture.draw(ctx.get());
		super.draw(ctx);
	}
	
	flyTo(to) {
		const distance = to.getDistance(this._position);
		const duration = this._timeFixed + distance * this._timePerMeter;
		const angle = Math.atan2(
			this._position.y()-to.y(),
			this._position.x()-to.x()
		) + Math.PI/2;
		this.setAngle(angle);
		this._action = new QQ.Actions.BallisticsMove({
			subj: this,
			to, duration
		});
		this._action.setOnEnd( () => this.hit() );
	}
	
	hit() {
		const hitted = this._world.getAllSubjectsAtPoint(this._position);
		const hittedEnemies = [];
		for ( const enemy of hitted ) {
			if ( enemy instanceof Man && enemy.isAlive() ) {
				hittedEnemies.push(enemy);
			}
		}
		hittedEnemies.reverse();
		let hittedAmount = 0;
		for ( const enemy of hittedEnemies ) {
			if ( enemy.hitted(this._position) ) {
				++hittedAmount;
				if ( hittedAmount >= this._penetration ) {
					break;
				}
			}
		}
		if ( hittedAmount === 0) {
			const container = this._world.getSubject(
				(s) => s instanceof ArrowsGrave
			);
			this.cleanRelationships();
			container.addSubject(this);
		}
		this.disappear();
	}
	
	disappear() {
		this._action = new QQ.Actions.Disappear({
			subj:     this,
			duration: 0.3,
			onEnd:    () => this.deleteMe()
		});
	}
	
};
