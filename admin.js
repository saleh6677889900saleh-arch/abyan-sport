/* =========================================================
   إعداد Supabase
========================================================= */

const SUPABASE_URL =
    "https://ujbgrwgxhusgoobhoanx.supabase.co";


const SUPABASE_KEY =
    "sb_publishable_oE8HsCGOsmRvIg0XwzymMA_I_33XlZ6";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );



/* =========================================================
   العناصر
========================================================= */

const loginBox =
    document.getElementById("loginBox");


const adminBox =
    document.getElementById("adminBox");


const loginMessage =
    document.getElementById("loginMessage");


const userInfo =
    document.getElementById("userInfo");


const matchesContainer =
    document.getElementById("matches");


const teamsContainer =
    document.getElementById("teams");


const teamMessage =
    document.getElementById("teamMessage");


const matchMessage =
    document.getElementById("matchMessage");


const teamLogoInput =
    document.getElementById("teamLogo");


const logoPreview =
    document.getElementById("logoPreview");



let currentTeams = [];



/* =========================================================
   تسجيل الدخول
========================================================= */

async function login() {

    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const password =
        document
            .getElementById("password")
            .value;


    if (!email || !password) {

        loginMessage.textContent =
            "اكتب البريد الإلكتروني وكلمة المرور.";


        loginMessage.className =
            "message error";


        return;
    }


    loginMessage.textContent =
        "جاري تسجيل الدخول...";


    loginMessage.className =
        "message";


    const {
        data,
        error
    } =
        await supabaseClient.auth.signInWithPassword({

            email: email,

            password: password

        });


    if (error) {

        loginMessage.textContent =
            "فشل تسجيل الدخول: " +
            error.message;


        loginMessage.className =
            "message error";


        console.error(error);


        return;
    }


    await checkAdmin(data.user);

}



/* =========================================================
   التحقق من المدير
========================================================= */

async function checkAdmin(user) {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("admin_users")
            .select("user_id")
            .eq("user_id", user.id)
            .maybeSingle();


    if (error) {

        loginMessage.textContent =
            "حدث خطأ أثناء التحقق من صلاحية المدير: " +
            error.message;


        loginMessage.className =
            "message error";


        console.error(error);


        return;
    }


    if (!data) {

        loginMessage.textContent =
            "هذا الحساب ليس مديرًا.";


        loginMessage.className =
            "message error";


        await supabaseClient.auth.signOut();


        return;
    }


    loginBox.classList.add("hidden");


    adminBox.classList.remove("hidden");


    userInfo.textContent =
        "تم تسجيل الدخول كمدير: " +
        user.email;


    await loadAll();

}



/* =========================================================
   تحميل جميع البيانات
========================================================= */

async function loadAll() {

    await loadTeams();

    updatePlayerTeamSelect();

    await loadPlayers();

    await loadMatches();

}



/* =========================================================
   تحميل الفرق
========================================================= */

async function loadTeams() {

    teamsContainer.innerHTML =
        `
        <div class="loading">
            جاري تحميل الفرق...
        </div>
        `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("teams")
            .select("*")
            .order("id", {
                ascending: false
            });


    if (error) {

        teamsContainer.innerHTML =
            `
            <div class="message error">
                ❌ فشل تحميل الفرق:
                <br>
                ${escapeHtml(error.message)}
            </div>
            `;


        console.error(error);


        return;
    }


    currentTeams =
        data || [];


    updateTeamSelects();

    updatePlayerTeamSelect();


    if (!data || data.length === 0 {

        teamsContainer.innerHTML =
            `
            <div class="empty">
                لا توجد فرق حاليًا.
            </div>
            `;


        return;
    }


    teamsContainer.innerHTML = "";


    data.forEach(team => {

        const div =
            document.createElement("div");


        div.className =
            "team";


        let logoHtml;


        if (team.logo_url) {

            logoHtml =
                `
                <img
                    src="${escapeAttribute(team.logo_url)}"
                    class="team-logo"
                    alt="شعار ${escapeAttribute(team.name)}"
                >
                `;

        } else {

            logoHtml =
                `
                <div class="logo-box">
                    ⚽
                </div>
                `;

        }


        div.innerHTML =

            `
            <div class="team-header">

                ${logoHtml}

                <div>

                    <h3>
                        ${escapeHtml(team.name)}
                    </h3>

                    <div class="info">

                        ${
                            team.city
                                ? "📍 " +
                                  escapeHtml(team.city)
                                : ""
                        }

                        ${
                            team.coach
                                ? "<br>👨‍🏫 المدرب: " +
                                  escapeHtml(team.coach)
                                : ""
                        }

                        ${
                            team.founded_year
                                ? "<br>📅 تأسس: " +
                                  escapeHtml(
                                      team.founded_year
                                  )
                                : ""
                        }

                    </div>

                </div>

            </div>


            ${
                team.description
                    ? `
                    <p class="info">
                        ${escapeHtml(
                            team.description
                        )}
                    </p>
                    `
                    : ""
            }


            <button
                class="danger"
                onclick="deleteTeam(${team.id})"
            >
                🗑️ حذف الفريق
            </button>

            `;


        teamsContainer.appendChild(div);

    });

}



/* =========================================================
   تحديث قوائم الفرق
========================================================= */

function updateTeamSelects() {

    const homeSelect =
        document.getElementById("homeTeam");


    const awaySelect =
        document.getElementById("awayTeam");


    homeSelect.innerHTML =
        `
        <option value="">
            اختر الفريق المضيف
        </option>
        `;


    awaySelect.innerHTML =
        `
        <option value="">
            اختر الفريق الضيف
        </option>
        `;


    currentTeams.forEach(team => {

        const optionHome =
            document.createElement("option");


        optionHome.value =
            team.name;


        optionHome.textContent =
            team.name;


        homeSelect.appendChild(
            optionHome
        );


        const optionAway =
            document.createElement("option");


        optionAway.value =
            team.name;


        optionAway.textContent =
            team.name;


        awaySelect.appendChild(
            optionAway
        );

    });

}



/* =========================================================
   معاينة الشعار
========================================================= */

teamLogoInput.addEventListener(
    "change",
    function () {

        const file =
            this.files[0];


        if (!file) {

            logoPreview.style.display =
                "none";


            logoPreview.removeAttribute(
                "src"
            );


            return;
        }


        if (!file.type.startsWith("image/")) {

            teamMessage.textContent =
                "❌ الملف المختار ليس صورة.";


            teamMessage.className =
                "message error";


            this.value = "";


            logoPreview.style.display =
                "none";


            return;
        }


        const maxSize =
            5 * 1024 * 1024;


        if (file.size > maxSize) {

            teamMessage.textContent =
                "❌ حجم الصورة أكبر من 5 ميجابايت.";


            teamMessage.className =
                "message error";


            this.value = "";


            logoPreview.style.display =
                "none";


            return;
        }


        const reader =
            new FileReader();


        reader.onload =
            function(event) {

                logoPreview.src =
                    event.target.result;


                logoPreview.style.display =
                    "block";

            };


        reader.readAsDataURL(file);

    }
);



/* =========================================================
   إنشاء اسم ملف آمن
========================================================= */

function createSafeFileName(file) {

    let extension =
        "jpg";


    if (
        file &&
        file.name &&
        file.name.includes(".")
    ) {

        extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();

    }


    const allowedExtensions = [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif"
    ];


    if (
        !allowedExtensions.includes(
            extension
        )
    ) {

        extension =
            "jpg";

    }


    /*
       مهم جدًا:

       لا نستخدم اسم الصورة الأصلي.

       حتى لو كانت الصورة اسمها:
       النجم.jpg

       سيتم رفعها باسم مثل:
       team-logo-xxxxxxxx.jpg

       وبالتالي نتجنب:
       Invalid key
    */


    const randomId =
        crypto.randomUUID()
            .replace(/-/g, "");


    const fileName =
        "team-logo-" +
        randomId +
        "." +
        extension;


    /*
       نضع الصور داخل مجلد teams
    */

    return "teams/" + fileName;

}



/* =========================================================
   إضافة فريق
========================================================= */

async function addTeam() {

    const button =
        document.getElementById(
            "addTeamBtn"
        );


    const name =
        document
            .getElementById("teamName")
            .value
            .trim();


    const city =
        document
            .getElementById("teamCity")
            .value
            .trim();


    const coach =
        document
            .getElementById("teamCoach")
            .value
            .trim();


    const foundedYear =
        document
            .getElementById("teamYear")
            .value;


    const description =
        document
            .getElementById("teamDescription")
            .value
            .trim();


    const file =
        teamLogoInput.files[0];


    if (!name) {

        teamMessage.textContent =
            "❌ اكتب اسم الفريق.";


        teamMessage.className =
            "message error";


        return;
    }


    if (foundedYear) {

        const year =
            Number(foundedYear);


        if (
            !Number.isInteger(year) ||
            year < 1800 ||
            year > 2100
        ) {

            teamMessage.textContent =
                "❌ سنة التأسيس غير صحيحة.";


            teamMessage.className =
                "message error";


            return;
        }

    }


    if (file) {

        if (
            !file.type.startsWith(
                "image/"
            )
        ) {

            teamMessage.textContent =
                "❌ الملف المختار ليس صورة.";


            teamMessage.className =
                "message error";


            return;
        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            teamMessage.textContent =
                "❌ حجم الصورة أكبر من 5 ميجابايت.";


            teamMessage.className =
                "message error";


            return;
        }

    }


    button.disabled = true;


    teamMessage.textContent =
        "⏳ جاري إضافة الفريق...";


    teamMessage.className =
        "message";


    let logoUrl = null;

    let uploadedFilePath = null;



    /* =========================================
       رفع الشعار
    ========================================== */

    if (file) {

        /*
           اسم آمن بالكامل
        */

        const filePath =
            createSafeFileName(file);


        uploadedFilePath =
            filePath;


        teamMessage.textContent =
            "⏳ جاري رفع شعار الفريق...";


        const {
            error: uploadError
        } =
            await supabaseClient.storage
                .from("team-logos")
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl:
                            "3600",

                        upsert:
                            false,

                        contentType:
                            file.type
                    }
                );


        if (uploadError) {

            console.error(
                "Storage upload error:",
                uploadError
            );


            teamMessage.textContent =
                "❌ فشل رفع الشعار: " +
                uploadError.message;


            teamMessage.className =
                "message error";


            button.disabled = false;


            return;
        }


        /*
           الحصول على الرابط العام
        */

        const {
            data: publicData
        } =
            supabaseClient.storage
                .from("team-logos")
                .getPublicUrl(
                    filePath
                );


        if (
            !publicData ||
            !publicData.publicUrl
        ) {

            teamMessage.textContent =
                "❌ تم رفع الصورة لكن تعذر الحصول على رابطها.";


            teamMessage.className =
                "message error";


            button.disabled = false;


            return;
        }


        logoUrl =
            publicData.publicUrl;

    }



    /* =========================================
       إدخال الفريق في جدول teams
    ========================================== */

    const insertData = {

        name:
            name,

        logo_url:
            logoUrl,

        city:
            city || null,

        coach:
            coach || null,

        founded_year:
            foundedYear
                ? Number(foundedYear)
                : null,

        description:
            description || null

    };


    const {
        error: insertError
    } =
        await supabaseClient
            .from("teams")
            .insert(
                insertData
            );


    if (insertError) {

        console.error(
            "Teams insert error:",
            insertError
        );


        /*
           إذا تم رفع الصورة لكن فشل
           إدخال الفريق، نحاول حذف
           الصورة حتى لا تبقى ملفات
           غير مستخدمة.
        */

        if (uploadedFilePath) {

            await supabaseClient
                .storage
                .from("team-logos")
                .remove([
                    uploadedFilePath
                ]);

        }


        teamMessage.textContent =
            "❌ فشل إضافة الفريق: " +
            insertError.message;


        teamMessage.className =
            "message error";


        button.disabled = false;


        return;
    }



    /* =========================================
       نجاح
    ========================================== */

    teamMessage.textContent =
        "✅ تمت إضافة الفريق بنجاح.";


    teamMessage.className =
        "message ok";


    /*
       تنظيف النموذج
    */

    document
        .getElementById("teamName")
        .value = "";


    document
        .getElementById("teamCity")
        .value = "";


    document
        .getElementById("teamCoach")
        .value = "";


    document
        .getElementById("teamYear")
        .value = "";


    document
        .getElementById(
            "teamDescription"
        )
        .value = "";


    teamLogoInput.value = "";


    logoPreview.removeAttribute(
        "src"
    );


    logoPreview.style.display =
        "none";


    button.disabled = false;


    await loadTeams();

}



/* =========================================================
   حذف فريق
========================================================= */

async function deleteTeam(id) {

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف هذا الفريق؟"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("teams")
            .delete()
            .eq("id", id);


    if (error) {

        alert(
            "❌ فشل حذف الفريق:\n" +
            error.message
        );


        console.error(error);


        return;
    }


    alert(
        "✅ تم حذف الفريق."
    );


    await loadTeams();

}



/* =========================================================
   إضافة مباراة
========================================================= */

async function addMatch() {

    const button =
        document.getElementById(
            "addMatchBtn"
        );


    const homeTeam =
        document
            .getElementById("homeTeam")
            .value;


    const awayTeam =
        document
            .getElementById("awayTeam")
            .value;


    const matchDate =
        document
            .getElementById("matchDate")
            .value;


    const matchTime =
        document
            .getElementById("matchTime")
            .value;


    const stadium =
        document
            .getElementById("stadium")
            .value
            .trim();


    const status =
        document
            .getElementById("matchStatus")
            .value;


    if (!homeTeam) {

        matchMessage.textContent =
            "❌ اختر الفريق المضيف.";


        matchMessage.className =
            "message error";


        return;
    }


    if (!awayTeam) {

        matchMessage.textContent =
            "❌ اختر الفريق الضيف.";


        matchMessage.className =
            "message error";


        return;
    }


    if (
        homeTeam === awayTeam
    ) {

        matchMessage.textContent =
            "❌ لا يمكن أن يكون الفريقان متطابقين.";


        matchMessage.className =
            "message error";


        return;
    }


    if (!matchDate) {

        matchMessage.textContent =
            "❌ اختر تاريخ المباراة.";


        matchMessage.className =
            "message error";


        return;
    }


    if (!matchTime) {

        matchMessage.textContent =
            "❌ اختر وقت المباراة.";


        matchMessage.className =
            "message error";


        return;
    }


    button.disabled = true;


    matchMessage.textContent =
        "⏳ جاري إضافة المباراة...";


    matchMessage.className =
        "message";


    const {
        error
    } =
        await supabaseClient
            .from("matches")
            .insert({

                home_team:
                    homeTeam,

                away_team:
                    awayTeam,

                match_date:
                    matchDate,

                match_time:
                    matchTime,

                stadium:
                    stadium || null,

                home_score:
                    0,

                away_score:
                    0,

                status:
                    status

            });


    if (error) {

        console.error(error);


        matchMessage.textContent =
            "❌ فشل إضافة المباراة: " +
            error.message;


        matchMessage.className =
            "message error";


        button.disabled = false;


        return;
    }


    matchMessage.textContent =
        "✅ تمت إضافة المباراة بنجاح.";


    matchMessage.className =
        "message ok";


    document
        .getElementById("homeTeam")
        .value = "";


    document
        .getElementById("awayTeam")
        .value = "";


    document
        .getElementById("matchDate")
        .value = "";


    document
        .getElementById("matchTime")
        .value = "";


    document
        .getElementById("stadium")
        .value = "";


    document
        .getElementById("matchStatus")
        .value =
            "قادمة";


    button.disabled = false;


    await loadMatches();

}



/* =========================================================
   تحميل المباريات
========================================================= */

async function loadMatches() {

    matchesContainer.innerHTML =
        `
        <div class="loading">
            جاري تحميل المباريات...
        </div>
        `;


    const {
        data,
        error
    } =
        await supabaseClient
            .from("matches")
            .select("*")
            .order(
                "match_date",
                {
                    ascending: true
                }
            );


    if (error) {

        matchesContainer.innerHTML =
            `
            <div class="message error">

                ❌ فشل تحميل المباريات:

                <br>

                ${escapeHtml(
                    error.message
                )}

            </div>
            `;


        console.error(error);


        return;
    }


    if (
        !data ||
        data.length === 0
    ) {

        matchesContainer.innerHTML =
            `
            <div class="empty">
                لا توجد مباريات حاليًا.
            </div>
            `;


        return;
    }


    matchesContainer.innerHTML = "";


    data.forEach(match => {

        const div =
            document.createElement("div");


        div.className =
            "match";


        div.innerHTML =

            `
            <h3>

                ${escapeHtml(
                    match.home_team
                )}

                🆚

                ${escapeHtml(
                    match.away_team
                )}

            </h3>


            <div class="info">

                📅 التاريخ:
                ${escapeHtml(
                    match.match_date || ""
                )}

                <br>


                🕐 الوقت:
                ${escapeHtml(
                    match.match_time || ""
                )}

                <br>


                🏟️ الملعب:
                ${escapeHtml(
                    match.stadium ||
                    "غير محدد"
                )}

                <br>


                📌 الحالة:
                ${escapeHtml(
                    match.status ||
                    "غير محدد"
                )}

            </div>


            <div class="divider"></div>


            <div class="score">


                <div>

                    <label>

                        نتيجة
                        ${escapeHtml(
                            match.home_team
                        )}

                    </label>


                    <input
                        type="number"
                        min="0"
                        step="1"
                        id="home-${match.id}"
                        value="${Number.isInteger(match.home_score) ? match.home_score : 0}"
                    >

                </div>



                <div>

                    <label>

                        نتيجة
                        ${escapeHtml(
                            match.away_team
                        )}

                    </label>


                    <input
                        type="number"
                        min="0"
                        step="1"
                        id="away-${match.id}"
                        value="${Number.isInteger(match.away_score) ? match.away_score : 0}"
                    >

                </div>


            </div>


            <button
                class="success"
                onclick="updateScore(${match.id})"
            >
                💾 حفظ النتيجة
            </button>


            <button
                class="danger"
                onclick="deleteMatch(${match.id})"
            >
                🗑️ حذف المباراة
            </button>


            <div
                id="message-${match.id}"
                class="message"
            ></div>

            `;


        matchesContainer.appendChild(
            div
        );

    });

}



/* =========================================================
   تحديث نتيجة المباراة
========================================================= */

async function updateScore(matchId) {

    const homeInput =
        document.getElementById(
            "home-" + matchId
        );


    const awayInput =
        document.getElementById(
            "away-" + matchId
        );


    const message =
        document.getElementById(
            "message-" + matchId
        );


    if (
        !homeInput ||
        !awayInput ||
        !message
    ) {

        return;
    }


    const homeScore =
        Number(
            homeInput.value
        );


    const awayScore =
        Number(
            awayInput.value
        );


    if (
        !Number.isInteger(
            homeScore
        ) ||
        homeScore < 0 ||
        !Number.isInteger(
            awayScore
        ) ||
        awayScore < 0
    ) {

        message.textContent =
            "❌ النتيجة غير صحيحة.";


        message.className =
            "message error";


        return;
    }


    message.textContent =
        "⏳ جاري حفظ النتيجة...";


    message.className =
        "message";


    const {
        error
    } =
        await supabaseClient
            .from("matches")
            .update({

                home_score:
                    homeScore,

                away_score:
                    awayScore,

                status:
                    "انتهت"

            })
            .eq(
                "id",
                matchId
            );


    if (error) {

        message.textContent =
            "❌ فشل الحفظ: " +
            error.message;


        message.className =
            "message error";


        console.error(error);


        return;
    }


    message.textContent =
        "✅ تم حفظ النتيجة بنجاح.";


    message.className =
        "message ok";


    await loadMatches();

}



/* =========================================================
   حذف مباراة
========================================================= */

async function deleteMatch(id) {

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف هذه المباراة؟"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } =
        await supabaseClient
            .from("matches")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "❌ فشل حذف المباراة:\n" +
            error.message
        );


        console.error(error);


        return;
    }


    alert(
        "✅ تم حذف المباراة."
    );


    await loadMatches();

}





/* =========================================================
   اللاعبون
========================================================= */

let currentPlayers = [];


const playersContainer =
    document.getElementById("players");

const playerMessage =
    document.getElementById("playerMessage");

const playerPhotoInput =
    document.getElementById("playerPhoto");

const playerPhotoPreview =
    document.getElementById("playerPhotoPreview");


function resetPlayerForm() {

    document.getElementById("playerId").value = "";
    document.getElementById("playerName").value = "";
    document.getElementById("playerTeam").value = "";
    document.getElementById("playerNumber").value = "";
    document.getElementById("playerPosition").value = "";
    document.getElementById("playerPhoto").value = "";
    document.getElementById("playerBirthDate").value = "";
    document.getElementById("playerNationality").value = "";
    document.getElementById("playerHeight").value = "";
    document.getElementById("playerWeight").value = "";
    document.getElementById("playerFoot").value = "";
    document.getElementById("playerBio").value = "";
    document.getElementById("playerActive").value = "true";

    playerPhotoPreview.src = "";
    playerPhotoPreview.style.display = "none";

    document.getElementById("playerFormTitle").textContent =
        "👤 إضافة لاعب جديد";

    document.getElementById("savePlayerBtn").textContent =
        "✅ حفظ اللاعب";

    playerMessage.textContent = "";
    playerMessage.className = "message";
}


function updatePlayerTeamSelect() {

    const select =
        document.getElementById("playerTeam");

    if (!select) return;

    const oldValue = select.value;

    select.innerHTML =
        '<option value="">اختر الفريق</option>';

    currentTeams.forEach(team => {

        const option =
            document.createElement("option");

        option.value = team.id;
        option.textContent = team.name;

        select.appendChild(option);
    });

    if (
        oldValue &&
        currentTeams.some(team => String(team.id) === String(oldValue))
    ) {
        select.value = oldValue;
    }
}


async function loadPlayers() {

    playersContainer.innerHTML =
        '<div class="loading">جاري تحميل اللاعبين...</div>';

    const {
        data,
        error
    } =
        await supabaseClient
            .from("players")
            .select(`
                *,
                teams (
                    id,
                    name,
                    logo_url
                )
            `)
            .order("id", { ascending: false });

    if (error) {

        playersContainer.innerHTML =
            `
            <div class="message error">
                ❌ فشل تحميل اللاعبين:
                <br>
                ${escapeHtml(error.message)}
            </div>
            `;

        console.error(error);
        return;
    }

    currentPlayers = data || [];

    if (!currentPlayers.length) {

        playersContainer.innerHTML =
            '<div class="empty">لا يوجد لاعبون حاليًا.</div>';

        return;
    }

    playersContainer.innerHTML = "";

    currentPlayers.forEach(player => {

        const div =
            document.createElement("div");

        div.className = "player-card";

        const photoHtml =
            player.photo_url
                ? `
                    <img
                        src="${escapeAttribute(player.photo_url)}"
                        class="player-photo"
                        alt="صورة ${escapeAttribute(player.full_name)}"
                    >
                  `
                : `
                    <div class="player-photo-placeholder">
                        👤
                    </div>
                  `;

        const teamName =
            player.teams?.name ||
            "بدون فريق";

        const status =
            player.is_active
                ? '<span class="badge active">نشط</span>'
                : '<span class="badge inactive">غير نشط</span>';

        div.innerHTML =
            `
            <div class="player-header">

                ${photoHtml}

                <div>

                    <h3>
                        ${escapeHtml(player.full_name)}
                    </h3>

                    <div class="info">
                        ⚽ الفريق:
                        ${escapeHtml(teamName)}
                        <br>

                        ${player.position
                            ? "📍 المركز: " +
                              escapeHtml(player.position) +
                              "<br>"
                            : ""}

                        ${player.shirt_number !== null &&
                          player.shirt_number !== undefined
                            ? "🔢 الرقم: " +
                              escapeHtml(player.shirt_number) +
                              "<br>"
                            : ""}

                        ${status}

                    </div>

                </div>

            </div>

            ${
                player.nationality ||
                player.birth_date ||
                player.height ||
                player.weight ||
                player.preferred_foot
                ? `
                    <div class="info">

                        ${
                            player.nationality
                                ? "🌍 الجنسية: " +
                                  escapeHtml(player.nationality) +
                                  "<br>"
                                : ""
                        }

                        ${
                            player.birth_date
                                ? "🎂 الميلاد: " +
                                  escapeHtml(player.birth_date) +
                                  "<br>"
                                : ""
                        }

                        ${
                            player.height
                                ? "📏 الطول: " +
                                  escapeHtml(player.height) +
                                  " سم<br>"
                                : ""
                        }

                        ${
                            player.weight
                                ? "⚖️ الوزن: " +
                                  escapeHtml(player.weight) +
                                  " كجم<br>"
                                : ""
                        }

                        ${
                            player.preferred_foot
                                ? "🦶 القدم: " +
                                  escapeHtml(player.preferred_foot)
                                : ""
                        }

                    </div>
                  `
                : ""
            }

            ${
                player.bio
                    ? `
                        <p class="info">
                            ${escapeHtml(player.bio)}
                        </p>
                      `
                    : ""
            }

            <div class="player-actions">

                <button
                    class="warning"
                    type="button"
                    onclick="editPlayer(${player.id})"
                >
                    ✏️ تعديل
                </button>

                <button
                    class="danger"
                    type="button"
                    onclick="deletePlayer(${player.id})"
                >
                    🗑️ حذف
                </button>

            </div>
            `;

        playersContainer.appendChild(div);
    });
}


function editPlayer(id) {

    const player =
        currentPlayers.find(
            item => Number(item.id) === Number(id)
        );

    if (!player) {
        alert("تعذر العثور على اللاعب.");
        return;
    }

    document.getElementById("playerId").value = player.id;
    document.getElementById("playerName").value = player.full_name || "";
    document.getElementById("playerTeam").value = player.team_id || "";
    document.getElementById("playerNumber").value =
        player.shirt_number ?? "";
    document.getElementById("playerPosition").value =
        player.position || "";
    document.getElementById("playerBirthDate").value =
        player.birth_date || "";
    document.getElementById("playerNationality").value =
        player.nationality || "";
    document.getElementById("playerHeight").value =
        player.height ?? "";
    document.getElementById("playerWeight").value =
        player.weight ?? "";
    document.getElementById("playerFoot").value =
        player.preferred_foot || "";
    document.getElementById("playerBio").value =
        player.bio || "";
    document.getElementById("playerActive").value =
        player.is_active ? "true" : "false";

    playerPhotoInput.value = "";

    if (player.photo_url) {
        playerPhotoPreview.src = player.photo_url;
        playerPhotoPreview.style.display = "block";
    } else {
        playerPhotoPreview.src = "";
        playerPhotoPreview.style.display = "none";
    }

    document.getElementById("playerFormTitle").textContent =
        "✏️ تعديل بيانات اللاعب";

    document.getElementById("savePlayerBtn").textContent =
        "💾 حفظ التعديلات";

    playerMessage.textContent = "";
    playerMessage.className = "message";

    document.getElementById("playerForm")
        .classList.remove("hidden");

    document.getElementById("playerForm")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
}


async function savePlayer() {

    const button =
        document.getElementById("savePlayerBtn");

    const playerId =
        document.getElementById("playerId").value.trim();

    const fullName =
        document.getElementById("playerName").value.trim();

    const teamId =
        document.getElementById("playerTeam").value;

    const shirtNumberValue =
        document.getElementById("playerNumber").value;

    const position =
        document.getElementById("playerPosition").value;

    const birthDate =
        document.getElementById("playerBirthDate").value;

    const nationality =
        document.getElementById("playerNationality").value.trim();

    const heightValue =
        document.getElementById("playerHeight").value;

    const weightValue =
        document.getElementById("playerWeight").value;

    const preferredFoot =
        document.getElementById("playerFoot").value;

    const bio =
        document.getElementById("playerBio").value.trim();

    const isActive =
        document.getElementById("playerActive").value === "true";

    const file =
        playerPhotoInput.files?.[0] || null;

    if (!fullName) {
        playerMessage.textContent = "❌ اكتب اسم اللاعب.";
        playerMessage.className = "message error";
        return;
    }

    if (!teamId) {
        playerMessage.textContent = "❌ اختر فريق اللاعب.";
        playerMessage.className = "message error";
        return;
    }

    if (
        shirtNumberValue !== "" &&
        (
            !Number.isInteger(Number(shirtNumberValue)) ||
            Number(shirtNumberValue) < 0 ||
            Number(shirtNumberValue) > 99
        )
    ) {
        playerMessage.textContent = "❌ رقم القميص غير صحيح.";
        playerMessage.className = "message error";
        return;
    }

    button.disabled = true;
    playerMessage.textContent =
        playerId
            ? "⏳ جاري حفظ تعديلات اللاعب..."
            : "⏳ جاري إضافة اللاعب...";
    playerMessage.className = "message";

    let photoUrl = null;
    let uploadedPath = null;

    if (file) {

        if (!file.type.startsWith("image/")) {
            playerMessage.textContent = "❌ الملف المختار ليس صورة.";
            playerMessage.className = "message error";
            button.disabled = false;
            return;
        }

        const extension =
            (file.name.split(".").pop() || "jpg")
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");

        const safeId =
            (crypto.randomUUID
                ? crypto.randomUUID()
                : Date.now().toString(36));

        uploadedPath =
            `players/${safeId}.${extension}`;

        playerMessage.textContent =
            "⏳ جاري رفع صورة اللاعب...";

        const {
            error: uploadError
        } =
            await supabaseClient.storage
                .from("player-photos")
                .upload(
                    uploadedPath,
                    file,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: file.type
                    }
                );

        if (uploadError) {

            console.error(uploadError);

            playerMessage.textContent =
                "❌ فشل رفع صورة اللاعب: " +
                uploadError.message;

            playerMessage.className = "message error";
            button.disabled = false;
            return;
        }

        const {
            data: publicData
        } =
            supabaseClient.storage
                .from("player-photos")
                .getPublicUrl(uploadedPath);

        photoUrl =
            publicData?.publicUrl || null;

        if (!photoUrl) {

            playerMessage.textContent =
                "❌ تم رفع الصورة لكن تعذر إنشاء رابطها.";

            playerMessage.className = "message error";
            button.disabled = false;
            return;
        }
    }

    const payload = {
        team_id: Number(teamId),
        full_name: fullName,
        shirt_number:
            shirtNumberValue === ""
                ? null
                : Number(shirtNumberValue),
        position: position || null,
        birth_date: birthDate || null,
        nationality: nationality || null,
        height:
            heightValue === ""
                ? null
                : Number(heightValue),
        weight:
            weightValue === ""
                ? null
                : Number(weightValue),
        preferred_foot: preferredFoot || null,
        bio: bio || null,
        is_active: isActive
    };

    if (photoUrl) {
        payload.photo_url = photoUrl;
    }

    let result;

    if (playerId) {

        result =
            await supabaseClient
                .from("players")
                .update(payload)
                .eq("id", Number(playerId));

    } else {

        result =
            await supabaseClient
                .from("players")
                .insert(payload);

    }

    if (result.error) {

        console.error(result.error);

        if (uploadedPath) {
            await supabaseClient.storage
                .from("player-photos")
                .remove([uploadedPath]);
        }

        playerMessage.textContent =
            "❌ فشل حفظ اللاعب: " +
            result.error.message;

        playerMessage.className = "message error";
        button.disabled = false;
        return;
    }

    playerMessage.textContent =
        playerId
            ? "✅ تم تحديث اللاعب بنجاح."
            : "✅ تمت إضافة اللاعب بنجاح.";

    playerMessage.className = "message ok";

    button.disabled = false;

    await loadPlayers();

    setTimeout(() => {
        resetPlayerForm();
        document.getElementById("playerForm")
            .classList.add("hidden");
    }, 500);
}


async function deletePlayer(id) {

    const player =
        currentPlayers.find(
            item => Number(item.id) === Number(id)
        );

    if (!player) return;

    const confirmed =
        confirm(
            `هل أنت متأكد من حذف اللاعب "${player.full_name}"؟`
        );

    if (!confirmed) return;

    const {
        error
    } =
        await supabaseClient
            .from("players")
            .delete()
            .eq("id", id);

    if (error) {

        alert(
            "❌ فشل حذف اللاعب:\n" +
            error.message
        );

        console.error(error);
        return;
    }

    alert("✅ تم حذف اللاعب.");

    await loadPlayers();
}


playerPhotoInput?.addEventListener(
    "change",
    function () {

        const file =
            this.files?.[0];

        if (!file) {
            playerPhotoPreview.src = "";
            playerPhotoPreview.style.display = "none";
            return;
        }

        const url =
            URL.createObjectURL(file);

        playerPhotoPreview.src = url;
        playerPhotoPreview.style.display = "block";
    }
);


document
    .getElementById("showPlayerFormBtn")
    ?.addEventListener(
        "click",
        function () {

            resetPlayerForm();
            updatePlayerTeamSelect();

            document.getElementById("playerForm")
                .classList.remove("hidden");

            document.getElementById("playerForm")
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
        }
    );


document
    .getElementById("savePlayerBtn")
    ?.addEventListener(
        "click",
        savePlayer
    );


document
    .getElementById("cancelPlayerBtn")
    ?.addEventListener(
        "click",
        function () {

            resetPlayerForm();

            document.getElementById("playerForm")
                .classList.add("hidden");
        }
    );



/* =========================================================
   تسجيل الخروج
========================================================= */

async function logout() {

    await supabaseClient
        .auth
        .signOut();


    adminBox
        .classList
        .add("hidden");


    loginBox
        .classList
        .remove("hidden");


    loginMessage.textContent =
        "تم تسجيل الخروج.";


    loginMessage.className =
        "message ok";

}



/* =========================================================
   حماية النصوص
========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}



/* =========================================================
   حماية خصائص HTML
========================================================= */

function escapeAttribute(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        );

}



/* =========================================================
   زر تسجيل الدخول
========================================================= */

document
    .getElementById("loginBtn")
    .addEventListener(
        "click",
        login
    );



/* =========================================================
   زر تسجيل الخروج
========================================================= */

document
    .getElementById("logoutBtn")
    .addEventListener(
        "click",
        logout
    );



/* =========================================================
   تحديث البيانات
========================================================= */

document
    .getElementById("loadAllBtn")
    .addEventListener(
        "click",
        loadAll
    );



/* =========================================================
   إضافة فريق
========================================================= */

document
    .getElementById("addTeamBtn")
    .addEventListener(
        "click",
        addTeam
    );



/* =========================================================
   إضافة مباراة
========================================================= */

document
    .getElementById("addMatchBtn")
    .addEventListener(
        "click",
        addMatch
    );



/* =========================================================
   إظهار نموذج الفريق
========================================================= */

document
    .getElementById(
        "showTeamFormBtn"
    )
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "teamForm"
                )
                .classList
                .remove("hidden");


            document
                .getElementById(
                    "matchForm"
                )
                .classList
                .add("hidden");


            window.scrollTo({
                top:
                    document
                        .getElementById(
                            "teamForm"
                        )
                        .offsetTop - 20,

                behavior:
                    "smooth"
            });

        }
    );



/* =========================================================
   إظهار نموذج المباراة
========================================================= */

document
    .getElementById(
        "showMatchFormBtn"
    )
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "matchForm"
                )
                .classList
                .remove("hidden");


            document
                .getElementById(
                    "teamForm"
                )
                .classList
                .add("hidden");


            updateTeamSelects();


            window.scrollTo({
                top:
                    document
                        .getElementById(
                            "matchForm"
                        )
                        .offsetTop - 20,

                behavior:
                    "smooth"
            });

        }
    );



/* =========================================================
   إلغاء إضافة الفريق
========================================================= */

document
    .getElementById(
        "cancelTeamBtn"
    )
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "teamForm"
                )
                .classList
                .add("hidden");

        }
    );



/* =========================================================
   إلغاء إضافة المباراة
========================================================= */

document
    .getElementById(
        "cancelMatchBtn"
    )
    .addEventListener(
        "click",
        function() {

            document
                .getElementById(
                    "matchForm"
                )
                .classList
                .add("hidden");

        }
    );



/* =========================================================
   التحقق من الجلسة عند فتح الصفحة
========================================================= */

async function checkSession() {

    const {
        data,
        error
    } =
        await supabaseClient
            .auth
            .getSession();


    if (error) {

        console.error(
            "Session error:",
            error
        );


        return;
    }


    if (
        data &&
        data.session
    ) {

        await checkAdmin(
            data.session.user
        );

    }

}



/* =========================================================
   تشغيل التحقق
========================================================= */

checkSession();


/* =========================================================
   مراقبة تسجيل الدخول والخروج
========================================================= */

supabaseClient
    .auth
    .onAuthStateChange(
        async function(
            event,
            session
        ) {

            if (
                event ===
                "SIGNED_OUT"
            ) {

                adminBox
                    .classList
                    .add("hidden");


                loginBox
                    .classList
                    .remove("hidden");


                return;
            }


            if (
                event ===
                "SIGNED_IN" &&
                session
            ) {

                await checkAdmin(
                    session.user
                );

            }

        }
    );