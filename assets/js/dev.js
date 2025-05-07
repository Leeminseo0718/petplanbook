
function deleteData(el, delArea) {
	const $btn = $(el);
	const $delArea = $btn.closest(delArea)
	Swal.fire({
		title: "정말 삭제할까요?",
		text: "이 작업은 되돌릴 수 없습니다.",
		icon: "warning",
		showCancelButton: true,
		confirmButtonColor: "#ffcd00",
		cancelButtonColor: "#dcdcdc", 
		confirmButtonText: "삭제하기",
		cancelButtonText: "취소",
	}).then((result) => {
		if (result.isConfirmed) {
			$delArea.remove()
			console.log( $delArea );
			console.log("삭제됨! 이거 그냥 만들어본거지 진짜 삭제인지는 모름");
			// 여기에 삭제 API 호출 or DOM 조작 등 추가
		} else {
			console.log("삭제 취소됨");
		}
	});
}

function deleteDataPage() {
		Swal.fire({
		title: "정말 삭제할까요?",
		text: "이 작업은 되돌릴 수 없습니다.",
		icon: "warning",
		showCancelButton: true,
		confirmButtonColor: "#ffcd00",
		cancelButtonColor: "#dcdcdc", 
		confirmButtonText: "삭제하기",
		cancelButtonText: "취소",
	}).then((result) => {
		Swal.fire({
			title: "삭제가 완료되었습니다.",
			icon: "success",
			confirmButtonText: "확인",
			showCancelButton: false
		});
	});
}

function loginOpenPage() {
	modalOpenId('login-modal');
	$('.modal .signup-area').hide();
	$('.modal .login-area').show();
}

function loginShow() {
	$('.modal .signup-area').hide();
	$('.modal .login-area').show();
	$('.login-form .button:contains("로그인")').removeClass('none');
}

function signupShow() {
	$('.modal .login-area').hide();
	$('.modal .signup-area').show();
	$('.signup-form .field.step2').hide();
	$('.button.-secondary').addClass('none');
	$('.button.-primary').addClass('none');
	$('.button:contains("다음")').removeClass('none');
	recalculateSignupFormHeight();
}

function optionalField(e) {
	const $form = $('.signup-form');

	$form.find('.field').removeClass('-error');

	const email = $form.find('[name="email"]').val()?.trim();
	const password = $form.find('[name="password"]').val()?.trim();
	const passwordConfirm = $form.find('[name="passwordConfirm"]').val()?.trim();

	// 1️⃣ 이메일 중복 체크
	fetch('/api/user/check-email', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ email })
	})
	.then(res => {
		if (res.status === 409) {
			$form.find('[name="email"]').closest('.field').addClass('-error');
			alert('이미 사용 중인 이메일입니다.');
			throw new Error('중복 이메일');
		}
		return res.json();
	})
	.then(() => {
		// 2️⃣ 비밀번호 일치 확인
		if (password !== passwordConfirm) {
			$form.find('[name="passwordConfirm"]').closest('.field').addClass('-error');
			alert('비밀번호가 일치하지 않습니다.');
			throw new Error('비밀번호 불일치');
		}

		// 3️⃣ 필수 입력값 모두 체크
		let isValid = true;
		$form.find('.field.step1 :input[required]').each(function () {
			const value = $(this).val()?.trim();
			if (!value) {
				$(this).closest('.field').addClass('-error');
				isValid = false;
			}
		});
		if (!isValid) {
			alert('모든 필수 입력값을 입력해 주세요.');
			throw new Error('필수 입력값 누락');
		}

		// 🔄 모든 검사 통과 시 다음 단계로
		$('.signup-form .field.step1').hide();
		$('.signup-form .field.step2').show();
		$(e).addClass('none');
		$(e).siblings('.button.-secondary').removeClass('none');
		$('.button.-primary').removeClass('none');
		recalculateSignupFormHeight();
	})
	.catch(err => {
		console.warn('검증 중단:', err.message);
	});
}

function continueOptionalStep(e) {
	let isValid = true;
	$('.signup-form .field.step1 :input[required]').each(function () {
		const value = $(this).val()?.trim();
		if (value === '') {
			isValid = false;
			$(this).closest('.field').addClass('-error');
		} else {
			$(this).closest('.field').removeClass('-error');
		}
	});
	if (!isValid) {
		alert('모든 필수 입력값을 입력해 주세요.');
		return;
	}
	$('.signup-form .field.step1').hide();
	$('.signup-form .field.step2').show();
	$(e).addClass('none');
	$(e).siblings('.button.-secondary').removeClass('none');
	$('.button.-primary').removeClass('none');
	recalculateSignupFormHeight();
}

function goBackToRequired(e) {
	$('.signup-form .field.step2').hide();
	$('.signup-form .field.step1').show();
	$(e).addClass('none');
	$(e).siblings('.button.-secondary').removeClass('none');
	$('.button.-primary').addClass('none');
	recalculateSignupFormHeight();
}

function setImagePreviewAll(contextSelector) {
	$(contextSelector).on('change', 'input[type="file"]', function (e) {
		const file = e.target.files[0];
		const $field = $(this).closest('.field');
		const $previewImg = $field.find('.img-view-box img');

		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = function (event) {
				$previewImg.attr('src', event.target.result);

				// 🔥 이미지 로드 후 폼 높이 다시 계산
				$previewImg.on('load', function () {
					recalculateSignupFormHeight();
				});
			};
			reader.readAsDataURL(file);
		} else {
			$previewImg.attr('src', '');
			recalculateSignupFormHeight(); // 이미지 지운 경우도 높이 반영
		}
	});
}

function recalculateSignupFormHeight() {
	let totalHeight = 0;
	$('.signup-form .field:visible').each(function () {
		totalHeight += $(this).outerHeight(true);
	});
	totalHeight += $('.signup-form .buttons').outerHeight(true);
	$('.signup-form').height(totalHeight);
}

function submitSignupForm() {
	const $form = $('.signup-form');

	// 회원가입 데이터 수집
	const signupData = {
		email: $form.find('[name="email"]').val()?.trim(),
		password: $form.find('[name="password"]').val()?.trim(),
		passwordConfirm: $form.find('[name="passwordConfirm"]').val()?.trim(),
		nickname: $form.find('[name="nickname"]').val()?.trim(),
		region: $form.find('[name="region"]').val(),
		pets: [],
		fileName: $form.find('[name="profileImage"]')[0]?.files[0]?.name || null
	};

	// 체크된 반려동물 종류 수집
	$form.find('input[name="pet"]:checked').each(function () {
		signupData.pets.push($(this).val());
	});

	// fetch 요청
	fetch('/api/user/signup', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(signupData)
	})
	.then(res => {
		if (!res.ok) {
			// 서버에서 409, 500 등의 오류 응답 시 JSON 추출 후 catch로 넘김
			return res.json().then(err => Promise.reject(err));
		}
		return res.json();
	})
	.then(data => {
		alert('회원가입이 완료되었습니다!');
		// 초기화
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
