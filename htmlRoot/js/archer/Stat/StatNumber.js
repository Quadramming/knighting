class StatNumber extends Stat {
	
	constructor(options) {
		super(options);
		// TODO: To styles
		this._textInfo = new QQ.Text({
			align: 'center',
			valign: 'middle',
			anchor: new QQ.Point(0.5, 0.5),
			size: new QQ.Size(10, 2),
			baseLine: 'middle',
			fontSize: 50,
			font: 'KenFuture',
			text: '',
			isClickable: false,
			color: '#6d543a',
			updateOnTick: options.textInfoUpdate
		});
	}
	
	getTextInfo(position) {
		if ( position ) {
			this._textInfo.setPosition(position);
		}
		this._textInfo.tick(0);
		return this._textInfo;
	}
	
}
