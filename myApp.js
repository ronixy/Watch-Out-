/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var MyLayer = cc.Layer.extend({

    circle: null,
    square: null,
    gameState: null,
    jumpHeight: null,
    runSpeed: null,
    currentTag: null,
    score: null,

    init:function () {

        //////////////////////////////
        // 1. super init first
        this._super();

        var winSize = cc.Director.getInstance().getWinSize();

        var bgTopHeight = winSize.height / 5 * 3 - 1;
        var bgBottomHeight = winSize.height / 5 * 2;

        //添加一个层
        var bg_top = cc.LayerColor.create(cc.c4(205,225,235,255), winSize.width, bgTopHeight);
        bg_top.setPosition(0, bgBottomHeight+1);
        bg_top.setTag(1000);
        bg_top.setAnchorPoint(0,0);
        this.addChild(bg_top, 1);

        var lineMiddle = cc.LayerColor.create(cc.c4(0,0,0,0), winSize.width, 1);
        lineMiddle.setPosition(0, bgBottomHeight);
        this.addChild(lineMiddle, 1);

        var bg_bottom = cc.LayerColor.create(cc.c4(63, 88, 100, 255), winSize.width, bgBottomHeight);
        bg_bottom.setPosition(0,0);
        bg_bottom.setTag(1001);
        bg_bottom.setAnchorPoint(0,0);
        this.addChild(bg_bottom, 0);

        cc.SpriteFrameCache.getInstance().addSpriteFrames(s_Plist, s_WatchOut);

        var scoreBg1 = cc.SpriteFrameCache.getInstance().getSpriteFrame("score_bg.png");
        var scoreBg = cc.Sprite.createWithSpriteFrame(scoreBg1);
        scoreBg.setPosition(bg_top.getContentSize().width/2, bg_top.getPositionY() + bg_top.getContentSize().height / 2);
        scoreBg.setScale(0.6,0.6);
        scoreBg.setAnchorPoint(0.5,0);
        scoreBg.setTag(1002);
        this.addChild(scoreBg, 1);

        var label = cc.LabelTTF.create("0","Arial",100);
        label.setPosition(scoreBg.getContentSize().width/2, scoreBg.getContentSize().height/2);
        label.setColor(cc.c4(205, 225, 235, 255));
        label.setTag(1003);
        scoreBg.addChild(label);

        var startMenuItem = cc.MenuItemImage.create();
        startMenuItem.setNormalSpriteFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("start_game.png"));
        startMenuItem.setSelectedSpriteFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("start_game.png"));
        startMenuItem.setPosition(bg_bottom.getContentSize().width/2, bg_bottom.getContentSize().height/2);
        startMenuItem.setCallback(this.startGame ,this);
        startMenuItem.setScale(0.8,0.8);
        var menu = cc.Menu.create(startMenuItem);
        menu.setPosition(0,0);
        menu.setTag(1004);
        this.addChild(menu,2);

        var circle1 = cc.SpriteFrameCache.getInstance().getSpriteFrame("yuanyuan.png");
        this.circle = cc.Sprite.createWithSpriteFrame(circle1);
        this.circle.setPosition(0,1);
        this.circle.setAnchorPoint(0,0);
        this.circle.setTag(1010);
        this.circle.setVisible(false);
        bg_top.addChild(this.circle);

        var square1 = cc.SpriteFrameCache.getInstance().getSpriteFrame("fangfang.png");
        this.square = cc.Sprite.createWithSpriteFrame(square1);
        this.square.setPosition(winSize.width,1);
        this.square.setAnchorPoint(1,0);
        this.square.setTag(1020);
        this.square.setVisible(false);
        bg_top.addChild(this.square);

        this.jumpHeight = this.circle.getContentSize().height * 0.9;
        this.gameState = 1;
        this.runSpeed = 2;
        this.score = 0;

        this.scheduleUpdate();

        this.setTouchEnabled(true);

        return true;
    },

    startGame: function(sender){
        var bgTop = this.getChildByTag(1000);
        this.runSpeed = 2.0;
        this.score = 0;
        var scoreBg = this.getChildByTag(1002);
        var scoreLabel = scoreBg.getChildByTag(1003);

        this.resetRunner();

        var startGame1 = this.getChildByTag(1004);
        startGame1.setVisible(false);
    },

    update: function(dt){

        var bgTop = this.getChildByTag(1000);

        if(this.gameState == 1){

            this.circle.setPositionX(this.circle.getPositionX() + this.runSpeed);
            this.square.setPositionX(this.square.getPositionX() - this.runSpeed);

            var circleBox = this.circle.getBoundingBox();
            var squareBox = this.square.getBoundingBox();

            //碰撞检测
            if(cc.rectIntersectsRect(squareBox, circleBox)){
                this.gameState = 2;

                var pExplosion = cc.ParticleExplosion.create();
                if(this.currentTag == this.circle.getTag()){
                    this.circle.setVisible(false);
                    pExplosion.setStartColor(cc.c4(57, 99, 207, 255));
                    pExplosion.setPosition(this.circle.getPositionX()+this.circle.getContentSize().width/4,
                        this.circle.getPositionY()+this.circle.getContentSize().height/4);
                    pExplosion.setTextureWithRect(cc.TextureCache.getInstance().addImage("watchout.png"), cc.rect(2,2,9,9));
                }
                else{
                    this.square.setVisible(false);
                    pExplosion.setStartColor(cc.c4(212, 74, 123, 255));
                    pExplosion.setPosition(this.square.getPositionX()+this.square.getContentSize().width/4,
                        this.square.getPositionY()+this.square.getContentSize().height/4);
                    pExplosion.setTextureWithRect(cc.TextureCache.getInstance().addImage("watchout.png"), cc.rect(13,2,9,9));
                }
                pExplosion.setStartSize(3);
                pExplosion.setEndColor(pExplosion.getStartColor());
                pExplosion.setLife(0.1);
                pExplosion.setTotalParticles(100);
                pExplosion.setRotationIsDir(false);
                pExplosion.setAutoRemoveOnFinish(true);

                pExplosion.setScale(0.5);
                bgTop.addChild(pExplosion, 10);

                var start = this.getChildByTag(1004);
                start.setVisible(true);
            }
            else if(squareBox.x + squareBox.width/2 + 150 < circleBox.x - circleBox.width/2){
                cc.log("reset");
                this.gameState = 3; //game reset
                this.circle.setVisible(false);
                this.square.setVisible(false);
                this.score++;

                if(this.score % 2 == 0){
                    this.runSpeed += 0.1;
                }
            }
        }
        else if(this.gameState == 3)
            this.resetRunner();

    },

    resetRunner: function(){
        var winSize = cc.Director.getInstance().getWinSize();
        var bgTop = this.getChildByTag(1000);

        this.circle.setAnchorPoint(cc.p(0,0));
        this.square.setAnchorPoint(cc.p(1,0));
        this.circle.setPosition(0,1);
        this.square.setPosition(winSize.width, 1);
        var rand = Math.random();
        if(rand < 0.5){
            this.currentTag = 1010;
            this.circle.setScale(0.4);
            this.square.setScale(0.8);
        }
        else{
            this.currentTag = 1020;
            this.square.setScale(0.4);
            this.circle.setScale(0.8);
        }

        this.circle.setVisible(true);
        this.square.setVisible(true);
        this.gameState = 1;
    },

    onTouchesBegan: function(touches, event){
        var touch = touches[0];
        var top = this.getChildByTag(1000);
        var location = touch.getLocation();
        var winSize = cc.Director.getInstance().getWinSize();

        if(this.gameState != 1)
            return true;

        cc.SpriteFrameCache.getInstance().addSpriteFrames(s_Plist, s_WatchOut);
        if(location.x >= winSize.width/2){
            var jumpAction = this.square.getActionByTag(1021);
            if(!jumpAction){
                this.square.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("fangfang_jump.png"));
                jumpAction = cc.Sequence.create(cc.JumpBy.create(0.5, cc.p(-80, 0), this.jumpHeight, 1),
                   cc.CallFunc.create(this.callbackRunAction, this, this.square));
                jumpAction.setTag(1021);
                this.square.runAction(jumpAction);
            }
            else if(jumpAction.isDone()){
                this.square.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("fangfang_jump.png"));
                this.square.runAction(jumpAction);
            }
        }
        else{
            var jumpAction = this.circle.getActionByTag(1011);
            if(!jumpAction){
                this.circle.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("yuanyuan_jump.png"));
                jumpAction = cc.Sequence.create(cc.JumpBy.create(0.5, cc.p(80, 0), this.jumpHeight, 1),
                    cc.CallFunc.create(this.callbackRunAction, this));
                jumpAction.setTag(1011);
                this.circle.runAction(jumpAction);
            }
            else if(jumpAction.isDone()){
                this.circle.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("yuanyuan_jump.png"));
                this.circle.runAction(jumpAction);
            }
        }
    },

    callbackRunAction: function(sprite){
        cc.SpriteFrameCache.getInstance().addSpriteFrames(s_Plist, s_WatchOut);
        if(sprite.getTag() == 1010){
            this.circle.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("yuanyuan.png"));
        }
        else if(sprite.getTag() == 1020){
            this.square.setDisplayFrame(cc.SpriteFrameCache.getInstance().getSpriteFrame("fangfang.png"));
        }
    }
});

var MyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MyLayer();
        this.addChild(layer);
        layer.init();
    }
});
