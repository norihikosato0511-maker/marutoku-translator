window.onload = () => {

    loadHistory();
    loadFavorites();

    const darkMode =
        localStorage.getItem("darkmode");

    if (darkMode === "true") {
        document.body.classList.add("dark");
    }
};

async function translateText() {

    const text =
        document.getElementById("inputText").value.trim();

    if (!text) {
        alert("入力してください");
        return;
    }

    const mode =
        document.getElementById("langMode").value;

    let langpair = "ja|en";

    if (mode === "en-ja") {
        langpair = "en|ja";
    }

    try {

        const response = await fetch(
            "https://api.mymemory.translated.net/get?q="
            + encodeURIComponent(text)
            + "&langpair="
            + langpair
        );

        const data = await response.json();

        const result =
            data.responseData.translatedText;

        document.getElementById("result")
            .textContent = result;

        saveHistory(text, result);

    } catch (error) {

        console.error(error);

        document.getElementById("result")
            .textContent = "翻訳に失敗しました";
    }
}

function copyResult() {

    const text =
        document.getElementById("result")
            .textContent;

    if (
        text === "" ||
        text === "ここに翻訳結果が表示されます"
    ) {
        alert("コピーする内容がありません");
        return;
    }

    navigator.clipboard.writeText(text);

    const btn =
        document.getElementById("copyBtn");

    btn.textContent = "✅ コピー完了";

    setTimeout(() => {
        btn.textContent = "📋 コピー";
    }, 1500);
}

function clearInput() {

    document.getElementById("inputText").value = "";

    document.getElementById("inputText").focus();
}

function speakResult() {

    const text =
        document.getElementById("result")
            .textContent;

    if (
        text === "" ||
        text === "ここに翻訳結果が表示されます"
    ) {
        alert("読み上げる内容がありません");
        return;
    }

    speakText(text);
}

function speakText(text) {

    speechSynthesis.cancel();

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 1.0;
    speech.pitch = 1.0;
    speech.volume = 1.0;

    speechSynthesis.speak(speech);
}

function stopSpeech() {

    speechSynthesis.cancel();
}

function saveHistory(jp, en) {

    let history =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];

    history.unshift({
        jp,
        en,
        date: new Date().toLocaleString()
    });

    history = history.slice(0, 100);

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    loadHistory();
}

function loadHistory() {

    const history =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];

    const list =
        document.getElementById("history");

    list.innerHTML = "";

    history.forEach((item, index) => {

        const li =
            document.createElement("li");

        const escapedText =
            item.en.replace(/'/g, "\\'");

        li.innerHTML = `
            <strong>入力：</strong>${item.jp}<br>
            <strong>結果：</strong>${item.en}<br>
            <small>${item.date}</small>
            <br><br>

            <button onclick="speakText('${escapedText}')">
                🔊 再生
            </button>

        <button class="trash-btn"
                onclick="deleteHistory(${index})">
                🗑️ 削除
        </button>
        `;

        list.appendChild(li);

    });
}

function deleteHistory(index) {

    if (!confirm("この履歴を削除しますか？")) {
        return;
    }

    let history =
        JSON.parse(
            localStorage.getItem("history")
        ) || [];

    history.splice(index, 1);

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    loadHistory();
}

function clearHistory() {

    if (!confirm("履歴をすべて削除しますか？")) {
        return;
    }

    localStorage.removeItem("history");

    loadHistory();
}

function addFavorite() {

    const text =
        document.getElementById("result")
            .textContent
            .trim();

    if (!text ||
        text === "ここに翻訳結果が表示されます") {

        alert("お気に入り登録する内容がありません");
        return;
    }

    let favorites =
        JSON.parse(
            localStorage.getItem("favorites")
        ) || [];

    favorites.unshift(text);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    loadFavorites();
}

function loadFavorites() {

    // localStorageから取得
    let favorites =
        JSON.parse(
            localStorage.getItem("favorites")
        ) || [];

    // null・undefined・空文字を除外
    favorites = favorites.filter(item =>
        item !== null &&
        item !== undefined &&
        String(item).trim() !== ""
    );

    // 除外後のデータを再保存
    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    const list =
        document.getElementById("favorites");

    if (!list) {
        console.error(
            "id='favorites' が見つかりません"
        );
        return;
    }

    list.innerHTML = "";

    favorites.forEach((item, index) => {

        const li =
            document.createElement("li");

        const escapedText =
            String(item)
                .replace(/'/g, "\\'")
                .replace(/"/g, "&quot;");

        li.innerHTML = `
            ${item}
            <br><br>

            <button onclick="speakText('${escapedText}')">
                🔊 再生
            </button>

            <button onclick="deleteFavorite(${index})">
                🗑️ 削除
            </button>

            <hr>
        `;

        list.appendChild(li);

    });
}

function deleteFavorite(index) {

    let favorites =
        JSON.parse(
            localStorage.getItem("favorites")
        ) || [];

    favorites.splice(index, 1);

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    loadFavorites();
}

function toggleDarkMode() {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "darkmode",
        document.body.classList.contains("dark")
    );
}

function clearFavorites() {

    if (!confirm("お気に入りをすべて削除しますか？")) {
        return;
    }

    localStorage.removeItem("favorites");

    loadFavorites();

    alert("お気に入りを削除しました");
}