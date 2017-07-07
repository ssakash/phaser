//  GlobalInputManager

var Class = require('../utils/Class');
var EventDispatcher = require('../events/EventDispatcher');
var GetTransformedPoint = require('./components/GetTransformedPoint');
var Keyboard = require('./keyboard/KeyboardManager');
var Mouse = require('./mouse/MouseManager');
var MouseEvent = require('./mouse/events/');
var PointWithinGameObject = require('./components/PointWithinGameObject');
var TransformMatrix = require('../gameobjects/components/TransformMatrix');
var PointScreenToWorldHitTest = require('./components/PointScreenToWorldHitTest');

var GlobalInputManager = new Class({

    initialize:

    function GlobalInputManager (game, config)
    {
        this.game = game;

        this.config = config;

        this.enabled = true;

        this.events = new EventDispatcher();

        //   Standard FIFO queue
        this.queue = [];

        //  Listeners
        this.keyboard = new Keyboard(this);
        this.mouse = new Mouse(this);

        this._tempMatrix = new TransformMatrix();
        this._tempPoint = { x: 0, y: 0 };
        this._tempHitTest = [];
    },

    /**
    * The Boot handler is called by Phaser.Game when it first starts up.
    * The renderer is available by now.
    *
    * @method Phaser.Input.KeyboardManager#boot
    * @private
    */
    boot: function ()
    {
        this.keyboard.boot();
        this.mouse.boot();
    },

    update: function ()
    {
        this.keyboard.update();

        var len = this.queue.length;

        if (!this.enabled || len === 0)
        {
            return;
        }

        //  Clears the queue array, and also means we don't work on array data that could potentially
        //  be modified during the processing phase
        var queue = this.queue.splice(0, len);

        //  Process the event queue, dispatching all of the events that have stored up
        for (var i = 0; i < len; i++)
        {
            var event = queue[i];

            switch (event.type)
            {
                case 'mousemove':
                    this.events.dispatch(new MouseEvent.MOVE(event));
                    break;

                case 'mousedown':
                    this.events.dispatch(new MouseEvent.DOWN(event));
                    break;

                case 'mouseup':
                    this.events.dispatch(new MouseEvent.UP(event));
                    break;
            }
        }
    },

    getTransformedPoint: function (gameObject, x, y)
    {
        return GetTransformedPoint(this._tempMatrix, gameObject, x, y, this._tempPoint);
    },

    pointWithinGameObject: function (gameObject, x, y)
    {
        return PointWithinGameObject(gameObject, x, y);
    },

    pointScreenToWorldHitTest: function (gameObjects, x, y, camera)
    {
        return PointScreenToWorldHitTest(this._tempMatrix, x, y, gameObjects, camera, this._tempHitTest);
    }

});

module.exports = GlobalInputManager;
