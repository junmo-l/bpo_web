document.addEventListener('wheel', function(event) {
    event.preventDefault(); // 스크롤 방지
}, { passive: false });
function changeColor(input) {
    if (input.value) {
        input.style.color = 'white'; // 입력된 글씨를 흰색으로 변경
    } else {
        input.style.color = 'black'; // 입력값이 없을 경우 검은색으로
    }
}

const searchIcon = document.getElementById('searchIcon');
const originalImage = "static/images/search-outline.png";
const hoverImageUrl = "static/images/search-outline(hover).png";

const rectangleDiv = document.querySelector('.rectangle-div');

rectangleDiv.addEventListener('mouseenter', () => {
    searchIcon.src = hoverImageUrl; // hover 이미지로 변경
});

rectangleDiv.addEventListener('mouseleave', () => {
    searchIcon.src = originalImage; // 원래 이미지로 변경
});
