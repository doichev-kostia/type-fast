type Finger = "thumb" | "index" | "middle" | "ring" | "pinky";
type Hand = "left" | "right";

type KeyFinger = `${Hand}-${Finger}`;

const keyFingers: KeyFinger[] = [
	"left-index",
	"left-middle",
	"left-ring",
	"left-pinky",
	"right-index",
	"right-middle",
	"right-ring",
	"right-pinky",
];

const KEY_FINGER_MAP: Record<string, KeyFinger> = {
	"q": "left-pinky",
	"w": "left-ring",
	"e": "left-middle",
	"r": "left-index",
	"t": "left-index",
	"y": "right-index",
	"u": "right-index",
	"i": "right-middle",
	"o": "right-ring",
	"p": "right-pinky",
	"a": "left-pinky",
	"s": "left-ring",
	"d": "left-middle",
	"f": "left-index",
	"g": "left-index",
	"h": "right-index",
	"j": "right-index",
	"k": "right-middle",
	"l": "right-ring",
	"z": "left-pinky",
	"x": "left-ring",
	"c": "left-middle",
	"v": "left-index",
	"b": "left-index",
	"n": "right-index",
	"m": "right-index",
};

const KEYS = Object.keys(KEY_FINGER_MAP);

const MILLISECONDS = {
	SECOND: 1000,
	MINUTE: 60 * 1000,
	HOUR: 60 * 60 * 1000,
}

const TERMINATING_KEY = "Escape";

const MODE_STORAGE_KEYS = {
	"CASE_SENSITIVE": "case-sensitive",
}

const isCaseSensitive = localStorage.getItem(MODE_STORAGE_KEYS.CASE_SENSITIVE) === "true";


type Constructor<T> = new (...args: any[]) => T;

function isDomElementAvailable<E extends HTMLElement>(element: unknown, target: Constructor<E>): element is E {
	return element instanceof target;
}

function getRandomInteger(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomKey(): string {
	const index = getRandomInteger(0, KEYS.length - 1);
	return KEYS[index];
}

function getFingerElements(): Record<KeyFinger, HTMLElement> {
	const fingerElements: Record<KeyFinger, HTMLElement> = {} as Record<KeyFinger, HTMLElement>;
	keyFingers.forEach((finger) => {
		const fingerElement = document.querySelector(`#${finger}`);
		if (!isDomElementAvailable(fingerElement, HTMLElement)) {
			throw new Error(`${finger} is not available`);
		}
		fingerElements[finger] = fingerElement;
	});

	return fingerElements;
}

const keyContainer = document.querySelector("#key");
if (!isDomElementAvailable(keyContainer, HTMLDivElement)) {
	throw new Error("keyContainer is not available");
}

const keyText = document.querySelector("#key-text");
if (!isDomElementAvailable(keyText, HTMLParagraphElement)) {
	throw new Error("keyText is not available");
}

const fingerElements = getFingerElements();
const score = document.querySelector("#score");
if (!isDomElementAvailable(score, HTMLParagraphElement)) {
	throw new Error("score is not available");
}

const time = document.querySelector("#time");
if (!isDomElementAvailable(time, HTMLTimeElement)) {
	throw new Error("time is not available");
}

const charactersPerMinute = document.querySelector("#cpm");
if (!isDomElementAvailable(charactersPerMinute, HTMLElement)) {
	throw new Error("charactersPerMinute is not available");
}

const caseSensitiveCheckbox = document.querySelector("#case-sensitive");
if (!isDomElementAvailable(caseSensitiveCheckbox, HTMLInputElement)) {
	throw new Error("caseSensitiveCheckbox is not available");
}

caseSensitiveCheckbox.checked = isCaseSensitive;
if (isCaseSensitive) {
	keyText.classList.remove("uppercase");
} else {
	keyText.classList.add("uppercase");
}

caseSensitiveCheckbox.addEventListener("change", (event) => {
	const isCaseSensitive = (event.currentTarget as HTMLInputElement).checked;
	if (isCaseSensitive) {
		keyText.classList.remove("uppercase");
	} else {
		keyText.classList.add("uppercase");
	}
	localStorage.setItem(MODE_STORAGE_KEYS.CASE_SENSITIVE, isCaseSensitive.toString());
})


let chosenKey = getRandomKey();
let isUpperCase = Math.random() > 0.5;
let chosenFinger = KEY_FINGER_MAP[chosenKey];
if (isUpperCase && isCaseSensitive) {
	keyText.textContent = chosenKey.toUpperCase();
} else {
	keyText.textContent = chosenKey.toLowerCase();
}
fingerElements[chosenFinger].classList.add("!bg-red-500");

let keysShown = 1;
let keysCorrect = 0;
let now: number | undefined = undefined;
let intervalId: number | undefined = undefined;

score.textContent = `${keysCorrect}/${keysShown}`;
time.textContent = "00:00";
charactersPerMinute.textContent = "0";


document.addEventListener("keyup", (event) => {
	if (event.key === "Meta" || event.key === "Control" || event.key === "Alt" || event.key === "Shift") {
		return;
	}
	if (event.key === TERMINATING_KEY && intervalId !== undefined) {
		clearInterval(intervalId);
		return;
	}
	if (now === undefined) {
		now = Date.now();
		intervalId = setInterval(() => {
			const timePassed = Date.now() - now!;
			const minutes = Math.floor(timePassed / MILLISECONDS.MINUTE);
			const seconds = Math.floor((timePassed % MILLISECONDS.MINUTE) / MILLISECONDS.SECOND);
			time.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
			const cpm = Math.floor((keysCorrect / timePassed) * MILLISECONDS.MINUTE);
			charactersPerMinute.textContent = cpm.toString();
		}, 1000)
	}
	const correctValue = isUpperCase && isCaseSensitive ? chosenKey.toUpperCase() : chosenKey.toLowerCase();
	if (event.key === correctValue) {
		fingerElements[chosenFinger].classList.remove("!bg-red-500");
		const newKey = getRandomKey();
		isUpperCase = Math.random() > 0.5;
		const newFinger = KEY_FINGER_MAP[newKey];
		if (isUpperCase && isCaseSensitive) {
			keyText.textContent = newKey.toUpperCase();
		} else {
			keyText.textContent = newKey.toLowerCase();
		}
		fingerElements[newFinger].classList.add("!bg-red-500");
		chosenKey = newKey;
		chosenFinger = newFinger;
		keysCorrect += 1;
	} else {
		keyContainer.classList.add("error");
		setTimeout(() => {
			keyContainer.classList.remove("error");
		}, 500);
	}

	keysShown += 1;
	score.textContent = `${keysCorrect}/${keysShown}`;
});
