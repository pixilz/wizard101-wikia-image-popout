const STUB_IMAGE_URL = 'thumb\\/d\\/d5\\/%28General%29_Doodle_Programmer.png\\/120px-%28General%29_Doodle_Programmer.png';
const CONTAINER_CLASS = 'contains-floating-wiki-image';
const FLOATY_BIT_CLASS = 'floating-wiki-image';

(() => {
	let fetchedImages = {};
	let newEl = document.createElement('div');
	let img = document.createElement('img');

	newEl.classList.add(FLOATY_BIT_CLASS);
	newEl.appendChild(img);

	let removeImage = () => {
		if (newEl.parentNode) {
			newEl.parentNode.classList.remove(CONTAINER_CLASS);
		}

		newEl.remove();
	};

	let displayImage = (anchorEl) => {
		img.src = fetchedImages[anchorEl.href];

		removeImage();
		anchorEl.parentNode.classList.add(CONTAINER_CLASS)
		anchorEl.parentNode.appendChild(newEl);
	};

	document
		.querySelectorAll('#bodyContent a')
		.forEach((anchorEl) => {
			let pageLink = anchorEl.href;

			if (!(/\/wiki\/(?!(File|Category|PetAbility|Template|Special):)[a-zA-Z0-9 ]+:.+/).test(anchorEl.href)) {
				return;
			}

			anchorEl.addEventListener('mouseenter', async () => {
				// We've previously fetched the data, no need to do so again.
				if (fetchedImages[pageLink]) {
					displayImage(anchorEl);
				} else {
					let response = await fetch(pageLink);

					switch (response.status) {
						// status "OK"
					case 200:
							let template = await response.text();

							let rx = new RegExp(`.*?"(\\/wiki\\/images\\/(?!${STUB_IMAGE_URL}).*?)".*`, 'gm'),
								matches = rx.exec(template),
								imageUrl = matches && matches[1];

							// Sometimes the page we are loading won't have any images on it
							// (in cases where we didnt actually want to get the data but we did because blacklists aren't always all inclusive)
							if (!matches) {
								return false;
							}

							fetchedImages[pageLink] = imageUrl;
							displayImage(anchorEl);
							break;

						// status "Not Found"
						case 404:
							console.log('Not Found');
							break;
					}
				}
			});

			anchorEl.addEventListener('mouseleave', () => {
				removeImage();
			});
		});
})();