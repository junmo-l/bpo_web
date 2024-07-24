(function ($) {
    $.fn.panel = function (userConfig) {
        if (this.length == 0) return this;
        if (this.length > 1) {
            for (var i = 0; i < this.length; i++) $(this[i]).panel(userConfig);
            return this;
        }

        var $this = $(this),
            $body = $("body"),
            $window = $(window),
            id = $this.attr("id"),
            config;

        config = $.extend({
            delay: 0,
            hideOnClick: false,
            hideOnEscape: false,
            hideOnSwipe: false,
            resetScroll: false,
            resetForms: false,
            side: null,
            target: $this,
            visibleClass: "header-visible",
        }, userConfig);

        if (typeof config.target != "jQuery") config.target = $(config.target);

        $this._hide = function (event) {
            if (!config.target.hasClass(config.visibleClass)) {
                return;
            }
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            config.target.removeClass(config.visibleClass);
            $('#headerToggle').css('opacity', '1').css('transform', 'translateY(-50%) translateX(0)');
            window.setTimeout(function () {
                if (config.resetScroll) {
                    $this.scrollTop(0);
                }
                if (config.resetForms) {
                    $this.find("form").each(function () {
                        this.reset();
                    });
                }
            }, config.delay);
        };

        $this._show = function (event) {
            if (config.target.hasClass(config.visibleClass)) {
                return;
            }
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            config.target.addClass(config.visibleClass);
            $('#headerToggle').css('opacity', '0').css('transform', 'translateY(-50%) translateX(-100%)');
        };

        $this.css("-ms-overflow-style", "-ms-autohiding-scrollbar")
             .css("-webkit-overflow-scrolling", "touch");

        if (config.hideOnClick) {
            $this.find("a").css("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
            $this.on("click", "a", function (event) {
                var $a = $(this),
                    href = $a.attr("href"),
                    target = $a.attr("target");

                if (!href || href == "#" || href == "" || href == "#" + id) return;

                event.preventDefault();
                event.stopPropagation();
                $this._hide();

                window.setTimeout(function () {
                    if (target == "_blank") window.open(href);
                    else window.location.href = href;
                }, config.delay + 10);
            });
        }

        $this.on("click touchend touchstart touchmove", function (event) {
            event.stopPropagation();
        });

        $('#headerToggle').on('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (config.target.hasClass(config.visibleClass)) {
                $this._hide(event);
            } else {
                $this._show(event);
            }
        });

        $('#groupImage').on('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            $this._hide(event);
        });

        $this.on('click', function(event) {
            event.stopPropagation();
        });

        $('.primary-section img').on('click', function(event) {
            event.stopPropagation();
        });

        $('#logo').on('click', function(event) {
            event.stopPropagation();
        });

        $('.navbar-options .placeholder img').on('click', function(event) {
            event.stopPropagation();
        });

        // 초기 상태 설정 - 화면 크기와 관계없이 상태를 유지하도록 함
        if (!$body.hasClass(config.visibleClass)) {
            $this._hide();
        } else {
            $this._show();
        }
        $('#headerToggle').css('opacity', '1').css('transform', 'translateY(-50%) translateX(0)');
    };
})(jQuery);
