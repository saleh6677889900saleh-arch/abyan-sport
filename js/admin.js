/* =========================================================
   أبيان سبورت
   لوحة تحكم المدير
   admin.js
========================================================= */


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

const playersContainer =
    document.getElementById("players");

const playerMessage =
    document.getElementById("playerMessage");

const playerPhotoInput =
    document.getElementById("playerPhoto");

const playerPhotoPreview =
    document.getElementById("playerPhotoPreview");


/* =========================================================
   البيانات الحالية
========================================================= */

let currentTeams = [];
let currentPlayers = [];


/* =========================================================
   أدوات مساعدة
========================================================= */

function showMessage(element, text, type = "") {

    if (!element) {
        return;
    }

    element.textContent = text;
    element.className =
        type
            ? `message ${type}`
            : "message";
}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function escapeAttribute(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}


function getFileExtension(file) {

    if (
        !file ||
        !file.name ||
        !file.name.includes(".")
    ) {
        return "jpg";
    }

    const extension =
        file.name
            .split(".")
            .pop()
            .toLowerCase();

    const allowed = [
        "jpg",
        "jpeg",
        "png",
        "webp",
        "gif"
    ];

    return allowed.includes(extension)
        ? extension
        : "jpg";
}


function createSafeFileName(file, prefix) {

    const extension =
        getFileExtension(file);

    let randomId;

    if (
        window.crypto &&
        typeof window.crypto.randomUUID === "function"
    ) {
        randomId =
            window.crypto
                .randomUUID()
                .replace(/-/g, "");
    } else {
        randomId =
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .substring(2);
    }

    return `${prefix}-${randomId}.${extension}`;
}


function isValidImage(file, maxSizeMB = 5) {

    if (!file) {
        return {
            valid: true
        };
    }

    if (!file.type.startsWith("image/")) {
        return {
            valid: false,
            message: "❌ الملف المختار ليس صورة."
        };
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif"
    ];

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            message:
                "❌ نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WEBP أو GIF."
        };
    }

    const maxSize =
        maxSizeMB * 1024 * 1024;

    if (file.size > maxSize) {
        return {
            valid: false,
            message:
                `❌ حجم الصورة أكبر من ${maxSizeMB} ميجابايت.`
        };
    }

    return {
        valid: true
    };
}


/* =========================================================
   تسجيل الدخول
========================================================= */

async function login() {

    const emailInput =
        document.getElementById("email");

    const passwordInput =
        document.getElementById("password");

    if (!emailInput || !passwordInput) {
        return;
    }

    const email =
        emailInput.value
            .trim();

    const password =
        passwordInput.value;

    if (!email || !password) {

        showMessage(
            loginMessage,
            "اكتب البريد الإلكتروني وكلمة المرور.",
            "error"
        );

        return;
    }

    showMessage(
        loginMessage,
        "⏳ جاري تسجيل الدخول..."
    );

    const {
        data,
        error
    } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    if (error) {

        console.error(
            "Login error:",
            error
        );

        showMessage(
            loginMessage,
            "❌ فشل تسجيل الدخول: " +
            error.message,
            "error"
        );

        return;
    }

    if (!data || !data.user) {

        showMessage(
            loginMessage,
            "❌ تعذر الحصول على بيانات المستخدم.",
            "error"
        );

        return;
    }

    await checkAdmin(data.user);
}


/* =========================================================
   التحقق من المدير
========================================================= */

async function checkAdmin(user) {

    if (!user) {
        return false;
    }

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

        console.error(
            "Admin check error:",
            error
        );

        showMessage(
            loginMessage,
            "❌ حدث خطأ أثناء التحقق من صلاحية المدير: " +
            error.message,
            "error"
        );

        return false;
    }

    if (!data) {

        showMessage(
            loginMessage,
            "❌ هذا الحساب ليس مديرًا.",
            "error"
        );

        await supabaseClient.auth.signOut();

        return false;
    }

    if (loginBox) {
        loginBox.classList.add("hidden");
    }

    if (adminBox) {
        adminBox.classList.remove("hidden");
    }

    if (userInfo) {

        userInfo.textContent =
            "تم تسجيل الدخول كمدير: " +
            (user.email || "");
    }

    await loadAll();

    return true;
}


/* =========================================================
   تحميل جميع البيانات
========================================================= */

async function loadAll() {

    await loadTeams();

    updateTeamSelects();

    updatePlayerTeamSelect();

    await loadPlayers();

    await loadMatches();
}


/* =========================================================
   تحميل الفرق
========================================================= */

async function loadTeams() {

    if (!teamsContainer) {
        return;
    }

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

        currentTeams = [];

        teamsContainer.innerHTML =
            `
            <div class="message error">
                ❌ فشل تحميل الفرق:
                <br>
                ${escapeHtml(error.message)}
            </div>
            `;

        console.error(
            "Load teams error:",
            error
        );

        return;
    }

    currentTeams =
        data || [];

    updateTeamSelects();
    updatePlayerTeamSelect();

    if (!data || data.length === 0) {

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
                                  escapeHtml(team.founded_year)
                                : ""
                        }

                    </div>

                </div>

            </div>

            ${
                team.description
                    ? `
                    <p class="info">
                        ${escapeHtml(team.description)}
                    </p>
                    `
                    : ""
            }

            <button
                class="danger"
                type="button"
                onclick="deleteTeam(${Number(team.id)})"
            >
                🗑️ حذف الفريق
            </button>
            `;

        teamsContainer.appendChild(div);
    });
}


/* =========================================================
   تحديث قوائم الفرق للمباريات
========================================================= */

function updateTeamSelects() {

    const homeSelect =
        document.getElementById("homeTeam");

    const awaySelect =
        document.getElementById("awayTeam");

    if (!homeSelect || !awaySelect) {
        return;
    }

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
   معاينة شعار الفريق
========================================================= */

if (teamLogoInput) {

    teamLogoInput.addEventListener(
        "change",
        function() {

            const file =
                this.files?.[0];

            if (!file) {

                if (logoPreview) {
                    logoPreview.style.display =
                        "none";

                    logoPreview.removeAttribute(
                        "src"
                    );
                }

                return;
            }

            const validation =
                isValidImage(file);

            if (!validation.valid) {

                showMessage(
                    teamMessage,
                    validation.message,
                    "error"
                );

                this.value = "";

                if (logoPreview) {
                    logoPreview.style.display =
                        "none";

                    logoPreview.removeAttribute(
                        "src"
                    );
                }

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function(event) {

                    if (!logoPreview) {
                        return;
                    }

                    logoPreview.src =
                        event.target.result;

                    logoPreview.style.display =
                        "block";
                };

            reader.readAsDataURL(file);
        }
    );
}


/* =========================================================
   إضافة فريق
========================================================= */

async function addTeam() {

    const button =
        document.getElementById("addTeamBtn");

    const nameInput =
        document.getElementById("teamName");

    const cityInput =
        document.getElementById("teamCity");

    const coachInput =
        document.getElementById("teamCoach");

    const yearInput =
        document.getElementById("teamYear");

    const descriptionInput =
        document.getElementById("teamDescription");

    if (
        !button ||
        !nameInput ||
        !cityInput ||
        !coachInput ||
        !yearInput ||
        !descriptionInput
    ) {
        return;
    }

    const name =
        nameInput.value.trim();

    const city =
        cityInput.value.trim();

    const coach =
        coachInput.value.trim();

    const foundedYear =
        yearInput.value;

    const description =
        descriptionInput.value.trim();

    const file =
        teamLogoInput?.files?.[0] || null;

    if (!name) {

        showMessage(
            teamMessage,
            "❌ اكتب اسم الفريق.",
            "error"
        );

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

            showMessage(
                teamMessage,
                "❌ سنة التأسيس غير صحيحة.",
                "error"
            );

            return;
        }
    }

    const validation =
        isValidImage(file);

    if (!validation.valid) {

        showMessage(
            teamMessage,
            validation.message,
            "error"
        );

        return;
    }

    button.disabled = true;

    showMessage(
        teamMessage,
        "⏳ جاري إضافة الفريق..."
    );

    let logoUrl = null;
    let uploadedFilePath = null;

    try {

        /* =========================================
           رفع الشعار
        ========================================== */

        if (file) {

            const fileName =
                createSafeFileName(
                    file,
                    "team-logo"
                );

            uploadedFilePath =
                `teams/${fileName}`;

            showMessage(
                teamMessage,
                "⏳ جاري رفع شعار الفريق..."
            );

            const {
                error: uploadError
            } =
                await supabaseClient
                    .storage
                    .from("team-logos")
                    .upload(
                        uploadedFilePath,
                        file,
                        {
                            cacheControl: "3600",
                            upsert: false,
                            contentType: file.type
                        }
                    );

            if (uploadError) {
                throw new Error(
                    "فشل رفع الشعار: " +
                    uploadError.message
                );
            }

            const {
                data: publicData
            } =
                supabaseClient
                    .storage
                    .from("team-logos")
                    .getPublicUrl(
                        uploadedFilePath
                    );

            logoUrl =
                publicData?.publicUrl || null;

            if (!logoUrl) {
                throw new Error(
                    "تم رفع الصورة لكن تعذر الحصول على رابطها."
                );
            }
        }


        /* =========================================
           إدخال الفريق
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
                .insert(insertData);

        if (insertError) {
            throw new Error(
                "فشل إضافة الفريق: " +
                insertError.message
            );
        }


        /* =========================================
           النجاح
        ========================================== */

        showMessage(
            teamMessage,
            "✅ تمت إضافة الفريق بنجاح.",
            "ok"
        );

        nameInput.value = "";
        cityInput.value = "";
        coachInput.value = "";
        yearInput.value = "";
        descriptionInput.value = "";

        if (teamLogoInput) {
            teamLogoInput.value = "";
        }

        if (logoPreview) {

            logoPreview.removeAttribute(
                "src"
            );

            logoPreview.style.display =
                "none";
        }

        await loadTeams();

    } catch (error) {

        console.error(
            "Add team error:",
            error
        );

        if (uploadedFilePath) {

            await supabaseClient
                .storage
                .from("team-logos")
                .remove([
                    uploadedFilePath
                ]);
        }

        showMessage(
            teamMessage,
            "❌ " + error.message,
            "error"
        );

    } finally {

        button.disabled = false;
    }
}


/* =========================================================
   حذف فريق
========================================================= */

async function deleteTeam(id) {

    if (!id) {
        return;
    }

    const confirmed =
        confirm(
            "هل أنت متأكد من حذف هذا الفريق؟\n\n" +
            "تأكد أولًا من عدم وجود لاعبين مرتبطين به."
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

        console.error(
            "Delete team error:",
            error
        );

        alert(
            "❌ فشل حذف الفريق:\n" +
            error.message
        );

        return;
    }

    alert(
        "✅ تم حذف الفريق."
    );

    await loadTeams();
    await loadPlayers();
}


/* =========================================================
   إضافة مباراة
========================================================= */

async function addMatch() {

    const button =
        document.getElementById("addMatchBtn");

    const homeInput =
        document.getElementById("homeTeam");

    const awayInput =
        document.getElementById("awayTeam");

    const dateInput =
        document.getElementById("matchDate");

    const timeInput =
        document.getElementById("matchTime");

    const stadiumInput =
        document.getElementById("stadium");

    const statusInput =
        document.getElementById("matchStatus");

    if (
        !button ||
        !homeInput ||
        !awayInput ||
        !dateInput ||
        !timeInput ||
        !stadiumInput ||
        !statusInput
    ) {
        return;
    }

    const homeTeam =
        homeInput.value;

    const awayTeam =
        awayInput.value;

    const matchDate =
        dateInput.value;

    const matchTime =
        timeInput.value;

    const stadium =
        stadiumInput.value.trim();

    const status =
        statusInput.value;

    if (!homeTeam) {

        showMessage(
            matchMessage,
            "❌ اختر الفريق المضيف.",
            "error"
        );

        return;
    }

    if (!awayTeam) {

        showMessage(
            matchMessage,
            "❌ اختر الفريق الضيف.",
            "error"
        );

        return;
    }

    if (homeTeam === awayTeam) {

        showMessage(
            matchMessage,
            "❌ لا يمكن أن يكون الفريقان متطابقين.",
            "error"
        );

        return;
    }

    if (!matchDate) {

        showMessage(
            matchMessage,
            "❌ اختر تاريخ المباراة.",
            "error"
        );

        return;
    }

    if (!matchTime) {

        showMessage(
            matchMessage,
            "❌ اختر وقت المباراة.",
            "error"
        );

        return;
    }

    button.disabled = true;

    showMessage(
        matchMessage,
        "⏳ جاري إضافة المباراة..."
    );

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
                    status || "قادمة"
            });

    if (error) {

        console.error(
            "Add match error:",
            error
        );

        showMessage(
            matchMessage,
            "❌ فشل إضافة المباراة: " +
            error.message,
            "error"
        );

        button.disabled = false;

        return;
    }

    showMessage(
        matchMessage,
        "✅ تمت إضافة المباراة بنجاح.",
        "ok"
    );

    homeInput.value = "";
    awayInput.value = "";
    dateInput.value = "";
    timeInput.value = "";
    stadiumInput.value = "";
    statusInput.value = "قادمة";

    button.disabled = false;

    await loadMatches();
}


/* =========================================================
   تحميل المباريات
========================================================= */

async function loadMatches() {

    if (!matchesContainer) {
        return;
    }

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
                ${escapeHtml(error.message)}
            </div>
            `;

        console.error(
            "Load matches error:",
            error
        );

        return;
    }

    if (!data || data.length === 0) {

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

        const homeScore =
            Number.isInteger(
                match.home_score
            )
                ? match.home_score
                : 0;

        const awayScore =
            Number.isInteger(
                match.away_score
            )
                ? match.away_score
                : 0;

        div.innerHTML =
            `
            <h3>

                ${escapeHtml(match.home_team)}

                🆚

                ${escapeHtml(match.away_team)}

            </h3>

            <div class="info">

                📅 التاريخ:
                ${escapeHtml(match.match_date || "")}

                <br>

                🕐 الوقت:
                ${escapeHtml(match.match_time || "")}

                <br>

                🏟️ الملعب:
                ${escapeHtml(match.stadium || "غير محدد")}

                <br>

                📌 الحالة:
                ${escapeHtml(match.status || "غير محدد")}

            </div>

            <div class="divider"></div>

            <div class="score">

                <div>

                    <label>
                        نتيجة ${escapeHtml(match.home_team)}
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="1"
                        id="home-${Number(match.id)}"
                        value="${homeScore}"
                    >

                </div>

                <div>

                    <label>
                        نتيجة ${escapeHtml(match.away_team)}
                    </label>

                    <input
                        type="number"
                        min="0"
                        step="1"
                        id="away-${Number(match.id)}"
                        value="${awayScore}"
                    >

                </div>

            </div>

            <button
                class="success"
                type="button"
                onclick="updateScore(${Number(match.id)})"
            >
                💾 حفظ النتيجة
            </button>

            <button
                class="danger"
                type="button"
                onclick="deleteMatch(${Number(match.id)})"
            >
                🗑️ حذف المباراة
            </button>

            <div
                id="message-${Number(match.id)}"
                class="message"
            ></div>
            `;

        matchesContainer.appendChild(div);
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
        Number(homeInput.value);

    const awayScore =
        Number(awayInput.value);

    if (
        !Number.isInteger(homeScore) ||
        homeScore < 0 ||
        !Number.isInteger(awayScore) ||
        awayScore < 0
    ) {

        showMessage(
            message,
            "❌ النتيجة غير صحيحة.",
            "error"
        );

        return;
    }

    showMessage(
        message,
        "⏳ جاري حفظ النتيجة..."
    );

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

        console.error(
            "Update score error:",
            error
        );

        showMessage(
            message,
            "❌ فشل الحفظ: " +
            error.message,
            "error"
        );

        return;
    }

    showMessage(
        message,
        "✅ تم حفظ النتيجة بنجاح.",
        "ok"
    );

    await loadMatches();
}


/* =========================================================
   حذف مباراة
========================================================= */

async function deleteMatch(id) {

    if (!id) {
        return;
    }

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

        console.error(
            "Delete match error:",
            error
        );

        alert(
            "❌ فشل حذف المباراة:\n" +
            error.message
        );

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

function resetPlayerForm() {

    const fields = [
        "playerId",
        "playerName",
        "playerTeam",
        "playerNumber",
        "playerPosition",
        "playerPhoto",
        "playerBirthDate",
        "playerNationality",
        "playerHeight",
        "playerWeight",
        "playerFoot",
        "playerBio"
    ];

    fields.forEach(id => {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        if (element.type === "file") {
            element.value = "";
        } else {
            element.value = "";
        }
    });

    const active =
        document.getElementById(
            "playerActive"
        );

    if (active) {
        active.value = "true";
    }

    if (playerPhotoPreview) {

        playerPhotoPreview.src = "";

        playerPhotoPreview.style.display =
            "none";
    }

    const title =
        document.getElementById(
            "playerFormTitle"
        );

    if (title) {
        title.textContent =
            "👤 إضافة لاعب جديد";
    }

    const saveButton =
        document.getElementById(
            "savePlayerBtn"
        );

    if (saveButton) {
        saveButton.textContent =
            "✅ حفظ اللاعب";
    }

    showMessage(
        playerMessage,
        ""
    );
}


/* =========================================================
   تحديث قائمة فرق اللاعبين
========================================================= */

function updatePlayerTeamSelect() {

    const select =
        document.getElementById(
            "playerTeam"
        );

    if (!select) {
        return;
    }

    const oldValue =
        select.value;

    select.innerHTML =
        `
        <option value="">
            اختر الفريق
        </option>
        `;

    currentTeams.forEach(team => {

        const option =
            document.createElement("option");

        option.value =
            team.id;

        option.textContent =
            team.name;

        select.appendChild(option);
    });

    if (
        oldValue &&
        currentTeams.some(
            team =>
                String(team.id) ===
                String(oldValue)
        )
    ) {
        select.value =
            oldValue;
    }
}


/* =========================================================
   تحميل اللاعبين
========================================================= */

async function loadPlayers() {

    if (!playersContainer) {
        return;
    }

    playersContainer.innerHTML =
        `
        <div class="loading">
            جاري تحميل اللاعبين...
        </div>
        `;

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
            .order(
                "id",
                {
                    ascending: false
                }
            );

    if (error) {

        currentPlayers = [];

        playersContainer.innerHTML =
            `
            <div class="message error">
                ❌ فشل تحميل اللاعبين:
                <br>
                ${escapeHtml(error.message)}
            </div>
            `;

        console.error(
            "Load players error:",
            error
        );

        return;
    }

    currentPlayers =
        data || [];

    if (!currentPlayers.length) {

        playersContainer.innerHTML =
            `
            <div class="empty">
                لا يوجد لاعبون حاليًا.
            </div>
            `;

        return;
    }

    playersContainer.innerHTML = "";

    currentPlayers.forEach(player => {

        const div =
            document.createElement("div");

        div.className =
            "player-card";

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

                        ${
                            player.position
                                ? "📍 المركز: " +
                                  escapeHtml(player.position) +
                                  "<br>"
                                : ""
                        }

                        ${
                            player.shirt_number !== null &&
                            player.shirt_number !== undefined
                                ? "🔢 الرقم: " +
                                  escapeHtml(player.shirt_number) +
                                  "<br>"
                                : ""
                        }

                        ${status}

                    </div>

                </div>

            </div>

            ${
                player.nationality ||
                player.birth_date ||
                player.height !== null ||
                player.weight !== null ||
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
                            player.height !== null &&
                            player.height !== undefined
                                ? "📏 الطول: " +
                                  escapeHtml(player.height) +
                                  " سم<br>"
                                : ""
                        }

                        ${
                            player.weight !== null &&
                            player.weight !== undefined
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
                    onclick="editPlayer(${Number(player.id)})"
                >
                    ✏️ تعديل
                </button>

                <button
                    class="danger"
                    type="button"
                    onclick="deletePlayer(${Number(player.id)})"
                >
                    🗑️ حذف
                </button>

            </div>
            `;

        playersContainer.appendChild(div);
    });
}


/* =========================================================
   تعديل لاعب
========================================================= */

function editPlayer(id) {

    const player =
        currentPlayers.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (!player) {

        alert(
            "تعذر العثور على اللاعب."
        );

        return;
    }

    document.getElementById(
        "playerId"
    ).value =
        player.id;

    document.getElementById(
        "playerName"
    ).value =
        player.full_name || "";

    document.getElementById(
        "playerTeam"
    ).value =
        player.team_id || "";

    document.getElementById(
        "playerNumber"
    ).value =
        player.shirt_number ?? "";

    document.getElementById(
        "playerPosition"
    ).value =
        player.position || "";

    document.getElementById(
        "playerBirthDate"
    ).value =
        player.birth_date || "";

    document.getElementById(
        "playerNationality"
    ).value =
        player.nationality || "";

    document.getElementById(
        "playerHeight"
    ).value =
        player.height ?? "";

    document.getElementById(
        "playerWeight"
    ).value =
        player.weight ?? "";

    document.getElementById(
        "playerFoot"
    ).value =
        player.preferred_foot || "";

    document.getElementById(
        "playerBio"
    ).value =
        player.bio || "";

    document.getElementById(
        "playerActive"
    ).value =
        player.is_active
            ? "true"
            : "false";

    if (playerPhotoInput) {
        playerPhotoInput.value = "";
    }

    if (
        player.photo_url &&
        playerPhotoPreview
    ) {

        playerPhotoPreview.src =
            player.photo_url;

        playerPhotoPreview.style.display =
            "block";

    } else if (playerPhotoPreview) {

        playerPhotoPreview.src =
            "";

        playerPhotoPreview.style.display =
            "none";
    }

    const title =
        document.getElementById(
            "playerFormTitle"
        );

    if (title) {
        title.textContent =
            "✏️ تعديل بيانات اللاعب";
    }

    const saveButton =
        document.getElementById(
            "savePlayerBtn"
        );

    if (saveButton) {
        saveButton.textContent =
            "💾 حفظ التعديلات";
    }

    showMessage(
        playerMessage,
        ""
    );

    const form =
        document.getElementById(
            "playerForm"
        );

    if (form) {

        form.classList.remove(
            "hidden"
        );

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


/* =========================================================
   حفظ اللاعب
========================================================= */

async function savePlayer() {

    const button =
        document.getElementById(
            "savePlayerBtn"
        );

    if (!button) {
        return;
    }

    const playerId =
        document.getElementById(
            "playerId"
        )?.value.trim() || "";

    const fullName =
        document.getElementById(
            "playerName"
        )?.value.trim() || "";

    const teamId =
        document.getElementById(
            "playerTeam"
        )?.value || "";

    const shirtNumberValue =
        document.getElementById(
            "playerNumber"
        )?.value || "";

    const position =
        document.getElementById(
            "playerPosition"
        )?.value || "";

    const birthDate =
        document.getElementById(
            "playerBirthDate"
        )?.value || "";

    const nationality =
        document.getElementById(
            "playerNationality"
        )?.value.trim() || "";

    const heightValue =
        document.getElementById(
            "playerHeight"
        )?.value || "";

    const weightValue =
        document.getElementById(
            "playerWeight"
        )?.value || "";

    const preferredFoot =
        document.getElementById(
            "playerFoot"
        )?.value || "";

    const bio =
        document.getElementById(
            "playerBio"
        )?.value.trim() || "";

    const isActive =
        document.getElementById(
            "playerActive"
        )?.value === "true";

    const file =
        playerPhotoInput?.files?.[0] || null;


    /* =========================================
       التحقق
    ========================================== */

    if (!fullName) {

        showMessage(
            playerMessage,
            "❌ اكتب اسم اللاعب.",
            "error"
        );

        return;
    }

    if (!teamId) {

        showMessage(
            playerMessage,
            "❌ اختر فريق اللاعب.",
            "error"
        );

        return;
    }

    if (
        shirtNumberValue !== "" &&
        (
            !Number.isInteger(
                Number(shirtNumberValue)
            ) ||
            Number(shirtNumberValue) < 0 ||
            Number(shirtNumberValue) > 99
        )
    ) {

        showMessage(
            playerMessage,
            "❌ رقم القميص غير صحيح.",
            "error"
        );

        return;
    }

    if (
        heightValue !== "" &&
        Number(heightValue) < 0
    ) {

        showMessage(
            playerMessage,
            "❌ الطول غير صحيح.",
            "error"
        );

        return;
    }

    if (
        weightValue !== "" &&
        Number(weightValue) < 0
    ) {

        showMessage(
            playerMessage,
            "❌ الوزن غير صحيح.",
            "error"
        );

        return;
    }

    const validation =
        isValidImage(file);

    if (!validation.valid) {

        showMessage(
            playerMessage,
            validation.message,
            "error"
        );

        return;
    }


    button.disabled = true;

    showMessage(
        playerMessage,
        playerId
            ? "⏳ جاري حفظ تعديلات اللاعب..."
            : "⏳ جاري إضافة اللاعب..."
    );

    let photoUrl = null;
    let uploadedPath = null;


    try {

        /* =========================================
           رفع صورة اللاعب
        ========================================== */

        if (file) {

            const fileName =
                createSafeFileName(
                    file,
                    "player-photo"
                );

            uploadedPath =
                `players/${fileName}`;

            showMessage(
                playerMessage,
                "⏳ جاري رفع صورة اللاعب..."
            );

            const {
                error: uploadError
            } =
                await supabaseClient
                    .storage
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

                throw new Error(
                    "فشل رفع صورة اللاعب: " +
                    uploadError.message
                );
            }

            const {
                data: publicData
            } =
                supabaseClient
                    .storage
                    .from("player-photos")
                    .getPublicUrl(
                        uploadedPath
                    );

            photoUrl =
                publicData?.publicUrl ||
                null;

            if (!photoUrl) {

                throw new Error(
                    "تم رفع الصورة لكن تعذر إنشاء رابطها."
                );
            }
        }


        /* =========================================
           بيانات اللاعب
        ========================================== */

        const payload = {

            team_id:
                Number(teamId),

            full_name:
                fullName,

            shirt_number:
                shirtNumberValue === ""
                    ? null
                    : Number(shirtNumberValue),

            position:
                position || null,

            birth_date:
                birthDate || null,

            nationality:
                nationality || null,

            height:
                heightValue === ""
                    ? null
                    : Number(heightValue),

            weight:
                weightValue === ""
                    ? null
                    : Number(weightValue),

            preferred_foot:
                preferredFoot || null,

            bio:
                bio || null,

            is_active:
                isActive
        };


        if (photoUrl) {
            payload.photo_url =
                photoUrl;
        }


        /* =========================================
           تحديث أو إضافة
        ========================================== */

        let result;

        if (playerId) {

            result =
                await supabaseClient
                    .from("players")
                    .update(payload)
                    .eq(
                        "id",
                        Number(playerId)
                    );

        } else {

            result =
                await supabaseClient
                    .from("players")
                    .insert(payload);
        }


        if (result.error) {

            throw new Error(
                "فشل حفظ اللاعب: " +
                result.error.message
            );
        }


        /* =========================================
           النجاح
        ========================================== */

        showMessage(
            playerMessage,
            playerId
                ? "✅ تم تحديث اللاعب بنجاح."
                : "✅ تمت إضافة اللاعب بنجاح.",
            "ok"
        );

        await loadPlayers();

        setTimeout(
            function() {

                resetPlayerForm();

                const form =
                    document.getElementById(
                        "playerForm"
                    );

                if (form) {
                    form.classList.add(
                        "hidden"
                    );
                }

            },
            500
        );

    } catch (error) {

        console.error(
            "Save player error:",
            error
        );

        if (uploadedPath) {

            await supabaseClient
                .storage
                .from("player-photos")
                .remove([
                    uploadedPath
                ]);
        }

        showMessage(
            playerMessage,
            "❌ " + error.message,
            "error"
        );

    } finally {

        button.disabled = false;
    }
}


/* =========================================================
   حذف لاعب
========================================================= */

async function deletePlayer(id) {

    const player =
        currentPlayers.find(
            item =>
                Number(item.id) ===
                Number(id)
        );

    if (!player) {

        alert(
            "تعذر العثور على اللاعب."
        );

        return;
    }

    const confirmed =
        confirm(
            `هل أنت متأكد من حذف اللاعب "${player.full_name}"؟`
        );

    if (!confirmed) {
        return;
    }

    const {
        error
    } =
        await supabaseClient
            .from("players")
            .delete()
            .eq(
                "id",
                id
            );

    if (error) {

        console.error(
            "Delete player error:",
            error
        );

        alert(
            "❌ فشل حذف اللاعب:\n" +
            error.message
        );

        return;
    }

    alert(
        "✅ تم حذف اللاعب."
    );

    await loadPlayers();
}


/* =========================================================
   معاينة صورة اللاعب
========================================================= */

if (playerPhotoInput) {

    playerPhotoInput.addEventListener(
        "change",
        function() {

            const file =
                this.files?.[0];

            if (!file) {

                if (playerPhotoPreview) {

                    playerPhotoPreview.src =
                        "";

                    playerPhotoPreview.style.display =
                        "none";
                }

                return;
            }

            const validation =
                isValidImage(file);

            if (!validation.valid) {

                showMessage(
                    playerMessage,
                    validation.message,
                    "error"
                );

                this.value = "";

                if (playerPhotoPreview) {

                    playerPhotoPreview.src =
                        "";

                    playerPhotoPreview.style.display =
                        "none";
                }

                return;
            }

            const url =
                URL.createObjectURL(file);

            if (playerPhotoPreview) {

                playerPhotoPreview.src =
                    url;

                playerPhotoPreview.style.display =
                    "block";
            }
        }
    );
}


/* =========================================================
   زر إضافة لاعب
========================================================= */

const showPlayerFormBtn =
    document.getElementById(
        "showPlayerFormBtn"
    );

if (showPlayerFormBtn) {

    showPlayerFormBtn.addEventListener(
        "click",
        function() {

            resetPlayerForm();

            updatePlayerTeamSelect();

            const form =
                document.getElementById(
                    "playerForm"
                );

            if (!form) {
                return;
            }

            form.classList.remove(
                "hidden"
            );

            form.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    );
}


/* =========================================================
   زر حفظ اللاعب
========================================================= */

const savePlayerBtn =
    document.getElementById(
        "savePlayerBtn"
    );

if (savePlayerBtn) {

    savePlayerBtn.addEventListener(
        "click",
        savePlayer
    );
}


/* =========================================================
   زر إلغاء اللاعب
========================================================= */

const cancelPlayerBtn =
    document.getElementById(
        "cancelPlayerBtn"
    );

if (cancelPlayerBtn) {

    cancelPlayerBtn.addEventListener(
        "click",
        function() {

            resetPlayerForm();

            const form =
                document.getElementById(
                    "playerForm"
                );

            if (form) {

                form.classList.add(
                    "hidden"
                );
            }
        }
    );
}


/* =========================================================
   تسجيل الخروج
========================================================= */

async function logout() {

    const {
        error
    } =
        await supabaseClient
            .auth
            .signOut();

    if (error) {

        console.error(
            "Logout error:",
            error
        );

        alert(
            "❌ فشل تسجيل الخروج:\n" +
            error.message
        );

        return;
    }

    if (adminBox) {
        adminBox.classList.add(
            "hidden"
        );
    }

    if (loginBox) {
        loginBox.classList.remove(
            "hidden"
        );
    }

    showMessage(
        loginMessage,
        "تم تسجيل الخروج.",
        "ok"
    );
}


/* =========================================================
   زر تسجيل الدخول
========================================================= */

const loginBtn =
    document.getElementById(
        "loginBtn"
    );

if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        login
    );
}


/* =========================================================
   زر تسجيل الخروج
========================================================= */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        logout
    );
}


/* =========================================================
   زر تحديث البيانات
========================================================= */

const loadAllBtn =
    document.getElementById(
        "loadAllBtn"
    );

if (loadAllBtn) {

    loadAllBtn.addEventListener(
        "click",
        loadAll
    );
}


/* =========================================================
   زر إضافة فريق
========================================================= */

const addTeamBtn =
    document.getElementById(
        "addTeamBtn"
    );

if (addTeamBtn) {

    addTeamBtn.addEventListener(
        "click",
        addTeam
    );
}


/* =========================================================
   زر إضافة مباراة
========================================================= */

const addMatchBtn =
    document.getElementById(
        "addMatchBtn"
    );

if (addMatchBtn) {

    addMatchBtn.addEventListener(
        "click",
        addMatch
    );
}


/* =========================================================
   إظهار نموذج الفريق
========================================================= */

const showTeamFormBtn =
    document.getElementById(
        "showTeamFormBtn"
    );

if (showTeamFormBtn) {

    showTeamFormBtn.addEventListener(
        "click",
        function() {

            const teamForm =
                document.getElementById(
                    "teamForm"
                );

            const matchForm =
                document.getElementById(
                    "matchForm"
                );

            if (teamForm) {
                teamForm.classList.remove(
                    "hidden"
                );
            }

            if (matchForm) {
                matchForm.classList.add(
                    "hidden"
                );
            }

            if (teamForm) {

                teamForm.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }
    );
}


/* =========================================================
   إظهار نموذج المباراة
========================================================= */

const showMatchFormBtn =
    document.getElementById(
        "showMatchFormBtn"
    );

if (showMatchFormBtn) {

    showMatchFormBtn.addEventListener(
        "click",
        function() {

            const matchForm =
                document.getElementById(
                    "matchForm"
                );

            const teamForm =
                document.getElementById(
                    "teamForm"
                );

            if (matchForm) {

                matchForm.classList.remove(
                    "hidden"
                );
            }

            if (teamForm) {

                teamForm.classList.add(
                    "hidden"
                );
            }

            updateTeamSelects();

            if (matchForm) {

                matchForm.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }
    );
}


/* =========================================================
   إلغاء إضافة الفريق
========================================================= */

const cancelTeamBtn =
    document.getElementById(
        "cancelTeamBtn"
    );

if (cancelTeamBtn) {

    cancelTeamBtn.addEventListener(
        "click",
        function() {

            const form =
                document.getElementById(
                    "teamForm"
                );

            if (form) {

                form.classList.add(
                    "hidden"
                );
            }

            showMessage(
                teamMessage,
                ""
            );
        }
    );
}


/* =========================================================
   إلغاء إضافة المباراة
========================================================= */

const cancelMatchBtn =
    document.getElementById(
        "cancelMatchBtn"
    );

if (cancelMatchBtn) {

    cancelMatchBtn.addEventListener(
        "click",
        function() {

            const form =
                document.getElementById(
                    "matchForm"
                );

            if (form) {

                form.classList.add(
                    "hidden"
                );
            }

            showMessage(
                matchMessage,
                ""
            );
        }
    );
}


/* =========================================================
   التحقق من الجلسة
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

        showMessage(
            loginMessage,
            "❌ حدث خطأ أثناء التحقق من الجلسة.",
            "error"
        );

        return;
    }

    if (
        data &&
        data.session &&
        data.session.user
    ) {

        await checkAdmin(
            data.session.user
        );
    }
}


/* =========================================================
   مراقبة تسجيل الدخول والخروج
========================================================= */

supabaseClient
    .auth
    .onAuthStateChange(
        async function(event, session) {

            if (
                event ===
                "SIGNED_OUT"
            ) {

                if (adminBox) {

                    adminBox.classList.add(
                        "hidden"
                    );
                }

                if (loginBox) {

                    loginBox.classList.remove(
                        "hidden"
                    );
                }

                return;
            }

            /*
               لا نحتاج هنا إلى استدعاء
               checkAdmin عند SIGNED_IN
               لأن login() يقوم بذلك بالفعل.
            */

        }
    );


/* =========================================================
   تشغيل الصفحة
========================================================= */

checkSession();


/* =========================================================
   جعل الدوال متاحة لأزرار onclick
========================================================= */

window.login =
    login;

window.logout =
    logout;

window.addTeam =
    addTeam;

window.deleteTeam =
    deleteTeam;

window.addMatch =
    addMatch;

window.updateScore =
    updateScore;

window.deleteMatch =
    deleteMatch;

window.editPlayer =
    editPlayer;

window.savePlayer =
    savePlayer;

window.deletePlayer =
    deletePlayer;
