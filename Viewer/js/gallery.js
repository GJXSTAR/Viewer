
var imgFormats = ['png', 'bmp', 'jpeg', 'jpg', 'gif', 'svg', 'xbm', 'webp'];


function changeBackgroundStyle() {
    var bg_color = localStorage["background_color"];
	if (!bg_color) {
        bg_color = "ff0000";
    }
    var bg_pattern = localStorage["background_pattern"];
	if (!bg_pattern) {
		bg_pattern = "bg6.png";
	}

	// build update string
	var newbackground = "";
	if (bg_pattern == "") {
		newbackground = "#" + bg_color;
	} else {
		newbackground = "#" + bg_color + " url('img/" + bg_pattern + "') repeat";
	}
	$('.gallery').css('background', newbackground);
}


$(window).load(function(){
    (function(){
        // update background
        changeBackgroundStyle();
    })();
});


$(function(){
    $(':input').labelauty();
    });


var viewPic = {

	$: function(selector){
		return document.querySelectorAll(selector);
	},

	addListener: function(target, type, handler) {
		if (target.addEventListener) {
			target.addEventListener(type,handler,false);
		} else if (target.attachEvent) {
			target.attachEvent("on"+type,handler);
		} else {
			target["on"+type] = handler;
		}
	},

	removeListener: function(target, type, handler) {
		if (target.removeEventListener) {
			target.removeEventListener(type, handler, false);
		} else if (target.detachEvent) {
			target.detachEvent("on" + type, handler);
		} else {
			target["on"+type] = handler;
		}
	},

	startup: function() {
        this.load();
        this.bind();
        this.init();
	},

	load: function() {
		this.images = [
			["img/640.webp","test"],
		];
		this.showNumber = 0;
		this.total = this.images.length;
		this.currentAngel = 0;
	},

	bind: function() {
		var that = this;

		// 适应窗口变化
		window.onresize = function() {
		    viewPic.$(".preview")[0].style.Width = "100%";
			viewPic.$(".preview")[0].style.Height = "100%";
			viewPic.$(".preview")[0].style.maxWidth = (window.innerWidth - 30)+"px";
			viewPic.$(".preview")[0].style.maxHeight = (window.innerHeight - 120)+"px";
			viewPic.$(".preview")[0].style.margin = "auto";
			that.updateThumpPositionBySingle();
		}

        var input = document.getElementById("chooseFoloder");

		// 打开文件夹
        input.addEventListener(
            "change",
            function(e) {
                that.images = [];
                that.total  = 0;
                var images = [];
                var file;
                var files = e.target.files;

                var parsesubfolder = $("input[name='parsesubfolders']:checked").val() == 'on';

                if (files.length > 0) {
                    filecounter = 0;
                    for (var i = 0, file; file = files[i]; i++) {
                        var filename = file.name;
                        var webkitpath = file.webkitRelativePath;
                        var subpathcount = webkitpath.split("/").length - 1;
                        if (false == parsesubfolder && subpathcount > 1) {
                            continue;
                        }
                        var ext = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
                        if (imgFormats.indexOf(ext) == -1) {
                            continue;
                        }
                        // window.URL.createObjectURL()
                        var fileUrl = window.URL.createObjectURL(file);
                        images.push([fileUrl, filename]);

                        filecounter++;
                    }

                    if (images.length > 0) {
                        that.images = images;
                        that.total  = images.length;
                        that.updateThumpList();
                        that.showNumber = 0;
                        that.showBigPic();
                        that.updateThumpPositionBySingle();
                        that.updateActiveThump();
                    }
                }
            },
            false
        );

		// 上一张图片
		viewPic.addListener(viewPic.$(".gallery-ctrl-pre-btn")[0], "click", function(){
			if (that.showNumber > 0) {
				that.showNumber -= 1;
			} else if (that.showNumber == 0) {
				that.showNumber = that.total - 1;
			}
			that.currentAngel = 0;
            that.showBigPic();
            that.updateThumpPositionBySingle();
            that.updateActiveThump();
            that.clockwise();
		});

		// 下一张图片
		viewPic.addListener(viewPic.$(".gallery-ctrl-next-btn")[0], "click", function(){
			if (that.showNumber < that.total-1) {
				that.showNumber += 1;
			} else if (that.showNumber == that.total - 1) {
				that.showNumber = 0;
			}
            that.currentAngel = 0;
            that.showBigPic();
            that.updateThumpPositionBySingle();
            that.updateActiveThump();
            that.clockwise();
		});

        // 选择图片
		viewPic.addListener(
		    viewPic.$(".gallery-thumb-list")[0],
		    "click",
		    function(event) {
			    var ele = event.target || event.srcElement;
			    var index = ele.parentNode.getAttribute("data-index") || ele.getAttribute("data-index");

			    if (index) {
				    that.showNumber = parseInt(index);
				    that.currentAngel = 0;
				    that.showBigPic();
				    that.updateThumpPositionBySingle();
				    that.updateActiveThump();
				    that.clockwise();
			    }
		    }
		);

		// 按左右键进行上一张和下一张图片选择
		viewPic.addListener(
		    document,
		    "keyup",
		    function(e) {
			    e = e || event;
			    if (e.keyCode == 37 || e.keyCode == 38) {
			        if (that.showNumber == 0) {
			            that.showNumber = that.total - 1;
			        } else {
    				    that.showNumber -= 1;
			        }

			    } else if (e.keyCode == 39 || e.keyCode == 40) {
			        if (that.showNumber == that.total - 1) {
			            that.showNumber = 0;
			        } else {
    				    that.showNumber += 1;
			        }
			    }
			    that.showBigPic();
                that.updateThumpPositionBySingle();
                that.updateActiveThump();
                that.clockwise();
		    }
		);

        // 点击上
		viewPic.addListener(viewPic.$(".gallery-thumb-pre-btn")[0], "click", function(){
			that.updateThumpPositionByGroup("left");
		});

        // 点击下
		viewPic.addListener(viewPic.$(".gallery-thumb-next-btn")[0], "click", function(){
					that.updateThumpPositionByGroup("right");
		});

        // 逆时针
		viewPic.addListener(viewPic.$(".gallery-counterclockwise-btn")[0], "click", function(){
					that.currentAngel = (that.currentAngel - 90) % 360;
					that.clockwise();
					that.showBigPic();
		});

        // 顺时针
		viewPic.addListener(viewPic.$(".gallery-clockwise-btn")[0], "click", function(){
					that.currentAngel = (that.currentAngel + 90) % 360;
					that.clockwise();
					that.showBigPic();
		});

	},

	init: function() {
		this.showNumber = 0;
		this.initBigPic();
		this.initThump();
	},

	initBigPic: function() {
		viewPic.$(".preview")[0].style.maxWidth = (window.innerWidth - 30)+"px";
		viewPic.$(".preview")[0].style.maxHeight = (window.innerHeight - 120)+"px";
		if (this.images.length > 0) {
			this.showBigPic();
			this.clockwise();
		}
	},

	showBigPic: function() {
		viewPic.$(".preview")[0].style.transform = "rotate("+this.currentAngel+"deg) scale(1)";
		viewPic.$(".preview")[0].style.backgroundImage = "url(" + this.images[this.showNumber][0] + ")";
	    $('#showtitle p.title').html(this.images[this.showNumber][1]);
	},

	// 更换下一张图时，thump list 位置
	updateThumpPositionBySingle: function(index) {
		viewPic.$(".gallery-thumb-list")[0].style.width = this.total*80+"px" || (window.innerWidth-100*2-80) + "px";
		index = index || this.showNumber;
		viewPic.$(".gallery-thumb-list")[0].style.left = ((window.innerWidth-100*2-80)/2-80*index) +"px";
	},

	// 更换下一图时，thump list 位置
	updateThumpPositionByGroup: function(direction, num) {
		var firstLeft= parseInt((window.innerWidth - 100*2 - 80)/2 - 80*0);
		var lastLeft= parseInt((window.innerWidth - 100*2 - 80)/2 - 80*(this.total - 1));
		var curLeft = parseInt(viewPic.$(".gallery-thumb-list")[0].style.left);

		viewPic.$(".gallery-thumb-list")[0].style.width = this.total * 80 + "px" || (window.innerWidth - 100*2 - 80) + "px";
		direction = direction || "left";
		num = num || 3;
		
		// 点击左边，向右移动，距离左边的距离增大，left 增大
		if (direction === "left") {
			if (curLeft < firstLeft) {
				if (firstLeft - curLeft <= 80*num) {
					viewPic.$(".gallery-thumb-list")[0].style.left =  firstLeft + "px";
					return ;
				} else {
					viewPic.$(".gallery-thumb-list")[0].style.left = Math.floor(curLeft+80*num)+"px";
					return ;
				}
			}
			
		} else {  // 点击右边，向左移动，距离左边的距离减小，left 减小
			if (curLeft > lastLeft) {
				if (curLeft - lastLeft<= 80*num) {
					viewPic.$(".gallery-thumb-list")[0].style.left = lastLeft+"px";
					return ;
				} else {
					viewPic.$(".gallery-thumb-list")[0].style.left = Math.floor(curLeft - 80*num)+"px";
					return ;
				}
			}
		}
	},

	// 更新 thump 图的当前选中状态
	updateActiveThump: function(index) {
		// 取消过去选中的
		if (viewPic.$(".gallery-thumb-item-focus").length > 0) {
			var tmpStr = viewPic.$(".gallery-thumb-item-focus")[0].className;
			viewPic.$(".gallery-thumb-item-focus")[0].className = tmpStr.split("gallery-thumb-item-focus").join("").trim();
		}

		// 使当前选中的显示蓝色边框
		viewPic.$("[data-index='"+this.showNumber+"']")[0].className += " gallery-thumb-item-focus";
	},

	initThump: function() {
		var thumpStr="";
		var that = this;
		
		// 初次初始化 thump list
		that.updateThumpList();
		that.showNumber = 0;
		that.updateThumpPositionBySingle();
		that.updateActiveThump();
		that.clockwise();
	},

	updateThumpList: function() {
		var that = this;
		var curItem = viewPic.$(".gallery-thumb-item");

		// 增加 thump
        var addThumpList = "";
        for (var i = 0; i < this.total; i++) {
            addThumpList += '<div class="gallery-thumb-item" data-index="'
            + i + '">'
            + '<div class="gallery-thumb-item-img" style="background-image: url());"></div>'
            + '<div class="gallery-thumb-item-border"></div>'
            + '</div>';
        }
        this.$(".gallery-thumb-list")[0].innerHTML = addThumpList;

        dl = this.$(".gallery-thumb-item").length;
        if (dl > this.total) {
            for (var i = 0; i < dl - this.total; i++) {
                this.$(".gallery-thumb-list")[0].removeChild(this.$(".gallery-thumb-item")[0]);
            }
        }

		var curImage = viewPic.$(".gallery-thumb-item-img");
		[].forEach.call(that.images,function(item, index){
		    curImage[index].style.backgroundImage = "url("+item[0]+")";
		});
	},

	// 旋转变化
	clockwise: function() {
	    angel = Math.abs(this.currentAngel % 180);
	    if (angel == 0) {
	        viewPic.$(".preview")[0].style.Width = "100%";
			viewPic.$(".preview")[0].style.Height = "100%";
			viewPic.$(".preview")[0].style.maxWidth = (window.innerWidth - 30)+"px";
			viewPic.$(".preview")[0].style.maxHeight = (window.innerHeight - 120)+"px";
	    	viewPic.$(".preview")[0].style.margin = "auto";
	    } else {
		    viewPic.$(".preview")[0].style.Width = "100%";
			viewPic.$(".preview")[0].style.Height = "100%";
			viewPic.$(".preview")[0].style.maxWidth = (window.innerHeight - 120)+"px";
			viewPic.$(".preview")[0].style.maxHeight = (window.innerWidth - 30)+"px";
			viewPic.$(".preview")[0].style.margin = "auto";
	    }
	},


};

viewPic.startup();




$(function() {

	// fade overlay with controls, fade container to display titles, changed Andreas Meyer
	if ($("#overlay").hasClass('hidden')) {
	    $('#overlay').fadeTo('slow', 0.00);
	} else {
	    $('#overlay').fadeTo('slow', 1);
	}

	$('#showtitle').fadeTo('slow', 0.00);
	$('#showtitle').hover(
		function () {
			$(this).fadeTo('fast', 1.00);
		},
		function () {
			$(this).fadeTo('fast', 0.00);
		}
	);

	// add hoven fading for overlay, Andreas Meyer
	$('#overlay').hover(
		function () {
			$(this).fadeTo('fast', 1);
		},
		function () {
			if ($("#overlay").hasClass('hidden')) {
			    $('#overlay').fadeTo('slow', 0.00);
			} else {
			    $('#overlay').fadeTo('slow', 1);
			}
			$(this).fadeTo('slow', 0.01);
		}
	);

	// toggle fieldsets
	$(".legend").click(function() {
		if ($(this).parent().hasClass('hidden')) {
			$(this).parent().css('height', 'auto').css('padding', '0px').removeClass('hidden').children().show();
			$(this).show().css('display', 'block');
		} else {
			$(this).parent().css('height','15px').css('padding', '10px').addClass('hidden').children().hide();
			$(this).show().css('display', 'block');
		}
	});

	// toggle overlay
	$("h1 a").click(function() {
		$(this).blur();
		if ($("#overlay").hasClass('hidden')) {
			$("#overlay").css('height','auto').removeClass('hidden').children().show();
			if ($('#thumbs1').hasClass('hidden')) {
				$('#thumbs1').hide();
			}
			if ($('#thumbs2').hasClass('hidden')) {
				$('#thumbs2').hide();
			}
		} else {
			$("#overlay").css('height','68px').addClass('hidden').children().hide();
			$("h1").show();
		}
		return false;
	});

});

