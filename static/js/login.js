document.addEventListener('DOMContentLoaded', function() {
    const loginCheckImg = document.getElementById('loginCheck');
    const loginCheck2Img = document.getElementById('loginCheck2');

    // 로그인 체크 이미지 클릭 이벤트
    loginCheckImg.addEventListener('click', () => {
        loginCheckImg.classList.add('hidden');
        loginCheck2Img.classList.remove('hidden');
    });

    loginCheck2Img.addEventListener('click', () => {
        loginCheck2Img.classList.add('hidden');
        loginCheckImg.classList.remove('hidden');
    });
});
