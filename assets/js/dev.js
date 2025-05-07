// ✅ Delete Data Function with Native confirm
function deleteData(el, delArea) {
    const $btn = $(el);
    const $delArea = $btn.closest(delArea);

    if (confirm("정말 삭제할까요?\n이 작업은 되돌릴 수 없습니다.")) {
        $delArea.remove();
        console.log($delArea);
        console.log("삭제됨! 이거 그냥 만들어본거지 진짜 삭제인지는 모름");
        // 여기에 삭제 API 호출 or DOM 조작 등 추가
    } else {
        return false;
    }
}

// ✅ Delete Data Page with Native confirm
function deleteDataPage() {
    if (confirm("정말 삭제할까요?\n이 작업은 되돌릴 수 없습니다.")) {
        alert("삭제가 완료되었습니다.");
        console.log("페이지 삭제 완료!");
        // 페이지 삭제 API 호출 or 동작 추가 가능
    } else {
        return false;
    }
}

// ✅ 헤더 로그인 기능
function loginOpenPage() {
	modalOpenId('login-modal');
	$('.modal .signup-area').hide();
	$('.modal .login-area').show();
}

// ✅ 헤더 회원가입 -> 로그인 교체
function loginShow() {
	$('.modal .signup-area').hide();
	$('.modal .login-area').show();
	$('.login-form .button:contains("로그인")').removeClass('none');
}

// ✅ 헤더 로그인 -> 회원가입 교체
function signupShow() {
	$('.modal .login-area').hide();
	$('.modal .signup-area').show();
	$('.signup-form .field.step2').hide();
	$('.button.-secondary').addClass('none');
	$('.button.-primary').addClass('none');
	$('.button:contains("다음")').removeClass('none');
	recalculateSignupFormHeight();
}

// ✅ 회원가입 step1 리팩토리
function optionalField(e) {
    const $form = $('.signup-form');
    $form.find('.field').removeClass('-error');

    const email = $form.find('[name="email"]').val()?.trim();
    const password = $form.find('[name="password"]').val()?.trim();
    const passwordConfirm = $form.find('[name="passwordConfirm"]').val()?.trim();

    // 회원가입 입력값 체크 후 step2 로 이동
    checkEmailDuplication(email)
        .then(() => verifyPasswordMatch(password, passwordConfirm))
        .then(() => checkRequiredFields($form))
        .then(() => moveToNextStep(e))
        .catch(err => console.warn('검증 중단:', err.message));
}

// ✅ 이메일 중복 체크
function checkEmailDuplication(email) {
    return fetch('/api/user/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    }).then(res => {
        if (res.status === 409) {
            $('.signup-form [name="email"]').closest('.field').addClass('-error');
            alert('이미 사용 중인 이메일입니다.');
            throw new Error('중복 이메일');
        }
        return res.json();
    });
}

// ✅ 비밀번호 확인
function verifyPasswordMatch(password, passwordConfirm) {
    if (password !== passwordConfirm) {
        $('.signup-form [name="passwordConfirm"]').closest('.field').addClass('-error');
        alert('비밀번호가 일치하지 않습니다.');
        throw new Error('비밀번호 불일치');
    }
}

// ✅ 필수 입력값 확인
function checkRequiredFields($form) {
    const isValid = $form.find('.field.step1 :input[required]').toArray().every(input => {
        const value = $(input).val()?.trim();
        if (!value) {
            $(input).closest('.field').addClass('-error');
            return false;
        }
        return true;
    });

    if (!isValid) {
        alert('모든 필수 입력값을 입력해 주세요.');
        throw new Error('필수 입력값 누락');
    }
}

// ✅ 다음 단계 이동
function moveToNextStep(e) {
    $('.signup-form .field.step1').hide();
    $('.signup-form .field.step2').show();
    $(e).addClass('none').siblings('.button.-secondary').removeClass('none');
    $('.button.-primary').removeClass('none');
    recalculateSignupFormHeight();
}

// ✅ 회원가입 이전
function goBackToRequired(e) {
	$('.signup-form .field.step2').hide();
	$('.signup-form .field.step1').show();
	$(e).addClass('none');
	$(e).siblings('.button.-secondary').removeClass('none');
	$('.button.-primary').addClass('none');
	recalculateSignupFormHeight();
}

// ✅ 회원가입 프로필 이미지 미리보기
function setImagePreviewAll(contextSelector) {
	$(contextSelector).on('change', 'input[type="file"]', function (e) {
		const file = e.target.files[0];
		const $field = $(this).closest('.field');
		const $previewImg = $field.find('.img-view-box img');

		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = function (event) {
				$previewImg.attr('src', event.target.result);
				$previewImg.on('load', function () {
					recalculateSignupFormHeight();
				});
			};
			reader.readAsDataURL(file);
		} else {
			$previewImg.attr('src', '');
			recalculateSignupFormHeight();
		}
	});
}

// ✅ 회원가입 변동 높이값 측정
function recalculateSignupFormHeight() {
	let totalHeight = 0;
	$('.signup-form .field:visible').each(function () {
		totalHeight += $(this).outerHeight(true);
	});
	totalHeight += $('.signup-form .buttons').outerHeight(true);
	$('.signup-form').height(totalHeight);
}

// ✅ 회원가입 변동 높이값 측정
function submitSignupForm() {
	const $form = $('.signup-form');

	// 1) 비밀번호 검증
	const pwd  = $form.find('[name="password"]').val()?.trim();
	const pwd2 = $form.find('[name="passwordConfirm"]').val()?.trim();
	if (pwd !== pwd2) {
		return alert('비밀번호가 일치하지 않습니다.');
	}

	// 2) 반려동물 수집
	const pets = [];
	$form.find('input[name="pet"]:checked').each(function () {
		pets.push($(this).val());
	});

	// 3) FormData 생성 (form 내 모든 input[name] + file 포함)
	const formEl  = document.getElementById('signup-field1');
	const formData = new FormData(formEl);

	// Multer가 받을 키에 맞춰 pet 배열을 문자열로 덮어쓰기
	formData.delete('pets');
	formData.append('cat_or_dog', pets.join(','));

	// 4) multipart/form-data 로 전송 (헤더 설정 NO)
	fetch('/api/user/signup', {
		method: 'POST',
		body: formData
	})
	.then(res => {
		if (!res.ok) {
			return res.json().then(err => Promise.reject(err));
		}
		return res.json();
	})
	.then(data => {
		alert('회원가입이 완료되었습니다!');

		// 5) 기존 리셋 & UI 복귀 로직
		$form[0].reset();
		$form.find('.img-view-box img').attr('src', '');
		$form.find('.field').removeClass('-error');
		$form.find('.field.step2').hide();
		$form.find('.field.step1').show();
		$form.find('.button.-secondary').addClass('none');
		$form.find('.button.-primary').addClass('none');
		$form.find('.button:contains("다음")').removeClass('none');
		recalculateSignupFormHeight();
		loginShow();
	})
	.catch(err => {
		console.error('회원가입 실패:', err);
		alert('회원가입 실패: ' + (err.message || '서버 오류'));
	});
}

function submitLogin() {
	const email = $('#login-email').val()?.trim();
	const password = $('#login-password').val()?.trim();
	
	if (!email || !password) {
		alert('이메일과 비밀번호를 모두 입력해 주세요.');
		return;
	}
	
	fetch('/api/user/login', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email, password }),
		credentials: 'include'
	})
	.then(res => res.json())
	.then(data => {
		if (data.success) {
			localStorage.setItem("user", JSON.stringify(data));
			localStorage.setItem("loginTime", Date.now());
			alert(`${data.nickname}님 환영합니다!`);
			console.log("로그인 응답 데이터:", data);
			modalClose();
			updateLoginButtons();
		} else {
			alert(`로그인 실패: ${data.message}`);
		}
	})
	.catch(err => {
		console.error('로그인 오류:', err);
		alert('서버 오류가 발생했습니다.');
	});
}

function checkLoginExpiration() {
	const loginTime = localStorage.getItem("loginTime");
	const expireDuration = 1000 * 60 * 60;
	if (loginTime && Date.now() - loginTime > expireDuration) {
		alert("로그인 시간이 만료되었습니다. 다시 로그인해 주세요.");
		logout();
	}
}

function logout() {
	localStorage.removeItem("user");
	localStorage.removeItem("loginTime");
	$('.btn-login').removeClass('none');
	$('.btn-logout').addClass('none');
	location.href = "/HM/HM010.html";
}

function updateLoginButtons() {
	const user = JSON.parse(localStorage.getItem("user"));
	if (user) {
		$('.btn-login').addClass('none');
		$('.btn-logout').removeClass('none');
		$('.welcome-msg').removeClass('none').text(`${user.nickname}님 반가워요!`);
	} else {
		$('.btn-login').removeClass('none');
		$('.btn-logout').addClass('none');
		$('.welcome-msg').addClass('none').text('');
	}
}

function errorInputClear() {
	$(document).on('keyup change', ':input[required]', function () {
		const $field = $(this).closest('.field');
		const type = $(this).attr('type');
		const value = $(this).val();
		if (type === 'file') {
			if (this.files.length > 0) {
				$field.removeClass('-error');
			}
		} else {
			if (value && value.trim().length > 0) {
				$field.removeClass('-error');
			}
		}
	});
}

function checkAccessPermission() {
	document.addEventListener('click', function (e) {
		const link = e.target.closest('a[href]');
		if (!link) return;

		const href = link.getAttribute('href');

		if (!href || href === '#' || href === '#none' || href.startsWith('javascript:')) return;

		const allowPaths = ['/HM/HM010.html', '/PL/PL010.html'];
		const isAllowed = allowPaths.some(path => href.endsWith(path));
		const user = JSON.parse(localStorage.getItem("user"));

		if (!user && !isAllowed) {
			e.preventDefault();
			alert("로그인 후 이용해주세요.");
		}
	});
}

function syncUserProfileUI(user) {
    const petsArray = (user.cat_or_dog || '').split(',').map(p => p.trim()).filter(p => p && p !== '없음');
    const orderedPets = ['강아지', '고양이'];
    const uniquePets = [...new Set(petsArray)];
    const normalizedPets = orderedPets.filter(p => uniquePets.includes(p)).join(', ') || '없음';

    $('#nickname-txt, #nickname').text(user.nickname);
    $('#region-txt, #made-region-txt').text(user.region);
    $('#pet-txt').text(normalizedPets);

    if (normalizedPets === '없음') {
        $('#pet-txt').closest('.profile-sentence').addClass('none');
    } else {
        $('#pet-txt').closest('.profile-sentence').removeClass('none');
    }

    $('input[name="pet"]').prop('checked', false);
    uniquePets.forEach(p => {
        if (p === '강아지') $('#dog1').prop('checked', true);
        if (p === '고양이') $('#cat2').prop('checked', true);
    });

    // ✅ 이미지 반영: src 체크 후 처리
    const $img = $('.profile-img img');
    if (user.profile_image_url) {
        $img.attr('src', user.profile_image_url)
            .show()
            .on('error', function() {
                $(this).addClass('none'); // 이미지 로드 실패 시 숨김
            });
    } else {
        $img.removeAttr('src').addClass('none');
    }
}

function profileEditMode(e) {
	const $editModeHasDiv = $('.profile-area');
	const $target = $(e);
	if (!$editModeHasDiv.hasClass('-edit-mode')) {
		$editModeHasDiv.addClass('-edit-mode');
		$('.profile-buttons .button.none').removeClass('none');
		$target.addClass('none');
	}

	const user = JSON.parse(localStorage.getItem("user"));
	if (user) {
		$('#nickname-input').val(user.nickname);
		$('#password-change').val('');
		$('#password-change-comp').val('');
		$('#region-select').val(user.region);

		// ✅ 반려동물 체크박스 초기화 및 설정
		const petValues = (user.cat_or_dog || "")
			.split(',')
			.map(v => v.trim())
			.filter(v => v && v !== '없음');

		const $petInputs = $('.profile-my-changes input[name="pet"]'); // 🎯 특정 영역만
		$petInputs.prop('checked', false);
		$petInputs.each(function () {
			if (petValues.includes($(this).val())) {
				$(this).prop('checked', true);
			}
		});
	}

	$('.profile-my-changes').removeClass('none');
	$('.profile-my-views').addClass('none');
}

function profileComp(e) {
	const user = JSON.parse(localStorage.getItem("user"));
	const email = user?.email;
	const nickname = $('#nickname-input').val()?.trim();
	const password = $('#password-change').val()?.trim();
	const passwordConfirm = $('#password-change-comp').val()?.trim();
	const region = $('#region-select').val();
	const fileInput = document.querySelector('#profile-img-input');
	const file = fileInput?.files[0];

	// ✅ 비밀번호 입력 확인
	if (!password) {
		alert("비밀번호를 입력해주세요.");
		return;
	}

	// ✅ 비밀번호 확인 입력 확인
	if (password !== passwordConfirm) {
		alert("비밀번호가 일치하지 않습니다.");
		return;
	}

	// ✅ 반려동물 체크된 값 수집
	const pets = $('.profile-my-changes input[name="pet"]:checked')
		.map(function () {
			return $(this).val();
		})
		.get();
	const petText = pets.length ? pets.join(", ") : "없음";

	// ✅ FormData 생성
	const formData = new FormData();
	formData.append("email", email);
	formData.append("nickname", nickname);
	formData.append("password", password);
	formData.append("region", region);
	formData.append("cat_or_dog", pets.join(','));

	if (file) {
		formData.append("profileImage", file);
	}

	fetch('/api/user/update-profile', {
		method: 'POST',
		body: formData
	})
	.then(res => {
		if (!res.ok) throw new Error("서버 응답 오류");
		return res.json();
	})
	.then(data => {
		if (data.success) {
			alert("프로필이 수정되었습니다!");
			
			// ✅ localStorage 업데이트
			const updatedUser = {
				...user,
				nickname,
				region,
				cat_or_dog: pets.join(','),
				profile_image_url: data.imageUrl || user.profile_image_url
			};
			localStorage.setItem("user", JSON.stringify(updatedUser));

			// ✅ UI 업데이트
			syncUserProfileUI(updatedUser);
			renderUserProfile();

			// ✅ 반려동물 텍스트 반영
			$('#pet-txt').text(petText);

			// ✅ 수정 완료 후 UI 복귀
			$('.profile-area').removeClass('-edit-mode');
			$('.profile-buttons .button.none').removeClass('none');
			$(e).addClass('none');
			$('.profile-my-changes').addClass('none');
			$('.profile-my-views').removeClass('none');
		} else {
			alert("수정 실패: " + data.message);
		}
	})
	.catch(err => {
		console.error("프로필 수정 오류:", err);
		alert("서버 오류가 발생했습니다.");
	});
}

function renderUserProfile() {
	const user = JSON.parse(localStorage.getItem("user"));
	if (!user) return;

	syncUserProfileUI(user);
}

function triggerProfileImageUpload(el) {
	const $input = $(el).closest('.profile-img').find('#profile-img-input');
	$input.click();
}

function handleProfileImageUpload(input) {
	const file = input.files[0];
	if (!file) return;
	
	const reader = new FileReader();
	reader.onload = function (e) {
		const $img = $(input).closest('.profile-img').find('img');
		$img.attr('src', e.target.result).removeClass('none');
	};

	reader.readAsDataURL(file);
}

// 프로필 이미지 삭제
function handleProfileImageDelete(el) {
	const user = JSON.parse(localStorage.getItem("user"));
	const email = user?.email;

	if (!email) {
		alert("로그인이 필요합니다.");
		return;
	}

	// 서버에 이미지 삭제 요청
	fetch('/api/user/delete-profile-image', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email })
	})
	.then(res => res.json())
	.then(data => {
		if (data.success) {
			alert("이미지 삭제 완료");

			// ✅ localStorage에서 이미지 URL 삭제
			const updatedUser = { ...user, profile_image_url: null };
			localStorage.setItem("user", JSON.stringify(updatedUser));

			// ✅ UI에서 이미지 제거 및 none 클래스 적용
			const $img = $(el).closest('.profile-img').find('img');
			$img.attr('src', '').addClass('none');
		} else {
			alert("이미지 삭제 실패: " + data.message);
		}
	})
	.catch(err => {
		console.error("이미지 삭제 오류:", err);
		alert("서버 오류가 발생했습니다.");
	});
}

function renderUserProfile() {
	const user = JSON.parse(localStorage.getItem("user"));
	if (!user) return;

	$('#nickname-txt, #nickname').text(user.nickname);
	$('#region-txt, #made-region-txt').text(user.region);

	const $img = $('.profile-img img');
	if (user.profile_image_url) {
		$img.attr('src', user.profile_image_url).removeClass('none');
	} else {
		$img.attr('src', '').addClass('none');
	}
}

document.addEventListener('DOMContentLoaded', () => {
	errorInputClear() // 인풋 유휴성 체크
	checkAccessPermission(); // 비로그인/로그인 페이지 진입 관련
});

/* 로드 페이지 관리 */
let basePath = '';
if (location.port === '8080') {
	// Node 서버: public 폴더 기준
	basePath = '';
} else if (location.port === '5500' || location.port === '5501') {
	// Live Server: html 폴더 내부 기준
	basePath = '/html';
}
$('.page .header').load(`${basePath}/ETC/header.html?v=${Date.now()}`, function () {
	updateLoginButtons();
	checkLoginExpiration();
});
$('.page .footer').load(`${basePath}/ETC/footer.html?v=${Date.now()}`);
$('.modal.-login-modal').load(`${basePath}/ETC/login.html?v=${Date.now()}`);
