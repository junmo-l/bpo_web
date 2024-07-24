(function ($) {
    var $window = $(window),
        $body = $("body"),
        $nav = $("#nav");

    // 초기 로딩 애니메이션
    $window.on("load", function () {
        window.setTimeout(function () {
            $body.removeClass("is-preload");
            // 초기 로딩 시 화면 크기에 관계없이 header-visible 클래스 제거
            // $body.removeClass("header-visible"); // 이 줄을 제거하여 초기 로딩 시 상태를 유지
        }, 100);
    });

    // Nav 설정
    // Scrolly 초기화
    $(".scrolly").scrolly();

    // Header 토글 버튼 생성
    $('<div id="headerToggle">' +
        '<a href="#header" class="toggle"></a>' +
        "</div>"
    ).appendTo($body);

    // Header 패널 설정
    $("#header").panel({
        delay: 500,
        hideOnClick: true,
        hideOnSwipe: true,
        resetScroll: true,
        resetForms: true,
        side: "left",
        target: $body,
        visibleClass: "header-visible",
    });

    // 화면 크기 변경 시 header-visible 클래스 설정 제거
    // $window.on("resize", function () {
    //    $body.removeClass("header-visible");
    //    $('#headerToggle').css('opacity', '1').css('transform', 'translateY(-50%) translateX(0)');
    // });
})(jQuery);
