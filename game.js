var WhamIt = {};

WhamIt.Game = function (game) {
  //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:
  this.game;      //  a reference to the currently running game (Phaser.Game)
  this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
  this.camera;    //  a reference to the game camera (Phaser.Camera)
  this.cache;     //  the game cache (Phaser.Cache)
  this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
  this.load;      //  for preloading assets (Phaser.Loader)
  this.math;      //  lots of useful common math operations (Phaser.Math)
  this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
  this.stage;     //  the game stage (Phaser.Stage)
  this.time;      //  the clock (Phaser.Time)
  this.tweens;    //  the tween manager (Phaser.TweenManager)
  this.state;     //  the state manager (Phaser.StateManager)
  this.world;     //  the game world (Phaser.World)
  this.particles; //  the particle manager (Phaser.Particles)
  this.physics;   //  the physics manager (Phaser.Physics)
  this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)
  //  You can use any of these from any function within this State.
  //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
};

WhamIt.Game.prototype = {
  hammer : null,
  badGuys : null,
  enemies : {},
  badGuyImages : [],
  exitKey : null,
  baseUrl : '',

  init: function () {
    //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
    this.input.maxPointers = 1;

    //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
    this.stage.disableVisibilityChange = true;
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

    if (this.game.device.desktop) {
      //  If you have any desktop specific settings, they can go in here
      this.scale.pageAlignHorizontally = true;
    } else {
      //  Same goes for mobile settings.
      //  In this case we're saying "scale the game, no lower than 480x260 and no higher than 1024x768"
      this.scale.setMinMax(480, 260, 1024, 768);
      this.scale.forceLandscape = true;
      this.scale.pageAlignHorizontally = true;
    }

    this.exitKey = this.input.keyboard.addKey(Phaser.Keyboard.ESC);
    this.exitKey.onDown.add(this.quitGame, this);
  },

  preload: function () {
    //  Here we load the assets required for our game
    for (var key in this.enemies) {
      this.load.image(key, this.enemies[key]);
      this.badGuyImages.push(key);
    }

//    console.log(this.baseUrl);
//    console.log(this.baseUrl.length);
//
//    if(this.baseUrl.length === 0) {
//      this.baseUrl = '';
//    }
    this.load.atlas('hammer', this.baseUrl +'images/sprites/hammer.png', this.baseUrl +'images/sprites/hammer.json');
    this.load.atlas('cracks', this.baseUrl + 'images/sprites/cracks.png', this.baseUrl +'images/sprites/cracks.json');
  },

  create: function () {
    this.badGuys = this.add.physicsGroup(Phaser.Physics.ARCADE);

    for (var key in this.badGuyImages) {
      var badGuy = this.badGuys.create(this.world.randomX, this.world.randomY, this.badGuyImages[key]);
      badGuy.inputEnabled = true;
      badGuy.health = 1;

      badGuy.events.onInputDown.add(this.listener, this);
    }

    this.badGuys.setAll('body.collideWorldBounds', true);
    this.badGuys.setAll('body.bounce.x', 0.5);
    this.badGuys.setAll('body.bounce.y', 0.5);
    this.badGuys.setAll('body.drag.x', 1000);
    this.badGuys.setAll('body.drag.y', 1000);
    this.badGuys.setAll('body.angularDrag', 1000);
    this.badGuys.setAll('body.allowRotation', true);
    this.badGuys.scale.setTo(0.5,0.5);

    this.physics.startSystem(Phaser.Physics.ARCADE);
    this.hammer = this.add.sprite(this.world.centerX, this.world.centerY, 'hammer');
    this.hammer.scale.setTo(0.75,0.75);
    this.hammer.frame = 5;
    this.hammer.animations.add('swing', [4, 3, 2, 1, 0], 30, false);
    this.hammer.anchor.set(0.02, 1);

    var text = this.add.text(this.world.width -200, this.world.height -30, "Press ESC to exit", { font: "24px Arial", fill: "#ffffff" });
  },

  update: function () {

    if (this.input.mousePointer.isDown) {
      this.hammer.animations.play('swing');
    }

    this.hammer.x =  this.input.x;
    this.hammer.y = this.input.y;
    this.physics.arcade.collide(this.badGuys);

  },

  listener : function(sprite, pointer) {
    if(sprite.health <= 0.1) {
      sprite.destroy();
    } else {
      sprite.crack = this.add.sprite(this.rnd.integerInRange(0, sprite.height), this.rnd.integerInRange(0, sprite.width), 'cracks', this.rnd.integerInRange(0, 8));
      sprite.crack.anchor.setTo(this.rnd.realInRange(0, 1));
      sprite.crack.scale.setTo(0.2,0.2);
      sprite.addChild(sprite.crack);

      sprite.health -= 0.1;
      sprite.body.velocity.set(this.rnd.integerInRange(-1200, 1200), this.rnd.integerInRange(-1200, 1200));
      sprite.body.angularVelocity = this.rnd.integerInRange(-360, 360);

    }
  },

  quitGame : function (pointer) {
    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.
    parent.window.postMessage("remove-me", "*");
  }

};

WhamIt.Game.prototype.addEnemies = function(enemies) {
  for (var key in enemies) {
    this.enemies[key] = enemies[key];
  }
};
WhamIt.Game.prototype.setBaseUrl = function(baseUrl) {
  this.baseUrl = baseUrl;
};