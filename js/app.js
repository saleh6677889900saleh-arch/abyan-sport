/* =========================================================
   أبيان سبورت
   js/app.js

   الواجهة الرئيسية
   الاتصال بـ Supabase
   المباريات + الفرق + اللاعبين
========================================================= */

"use strict";


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
   حالة التطبيق
========================================================= */

let teams = [];

let matches = [];

let players = [];

let currentFilter = "all";

let dataLoaded = false;


/* =========================================================
   دالة مختصرة للحصول على عنصر
========================================================= */

function $(id) {

    return document.getElementById(id);

}


/* =========================================================
   العناصر
========================================================= */

const connectionStatus =
    $("connectionStatus");

const totalMatches =
    $("totalMatches");

const liveMatches =
    $("liveMatches");

const totalTeams =
    $("totalTeams");

const totalPlayers =
    $("totalPlayers");

const liveMatchesContainer =
    $("liveMatches");

const matchesList =
    $("matchesList");

const teamsGrid =
    $("teamsGrid");

const playersGrid =
    $("playersGrid");

const liveCountBadge =
    $("liveCountBadge");

const teamsCountBadge =
    $("teamsCountBadge");

const playersCountBadge =
    $("playersCountBadge");

const refreshBtn =
    $("refreshBtn");

const menuBtn =
    $("menuBtn");

const mainNav =
    $("mainNav");

const detailsModal =
    $("detailsModal");

const modalContent =
    $("modalContent");

const closeModalBtn =
    $("closeModalBtn");


/* =========================================================
   تشغيل القائمة في الجوال
========================================================= */

if (
    menuBtn &&
    mainNav
) {

    menuBtn.addEventListener(
        "click",
        function () {

            mainNav.classList.toggle(
                "open"
            );

        }
    );

}


/* =========================================================
   إغلاق القائمة عند الضغط على رابط
========================================================= */

document.querySelectorAll(
    ".nav-link"
).forEach(function (link) {

    link.addEventListener(
        "click",
        function () {

            if (mainNav) {

                mainNav.classList.remove(
                    "open"
                );

            }

        }
    );

});


/* =========================================================
   الفلاتر
========================================================= */

document.querySelectorAll(
    ".filter-btn"
).forEach(function (button) {

    button.addEventListener(
        "click",
        function () {

            document.querySelectorAll(
                ".filter-btn"
            ).forEach(
                function (btn) {

                    btn.classList.remove(
                        "active"
                    );

                }
            );


            button.classList.add(
                "active"
            );


            currentFilter =
                button.dataset.filter ||
                "all";


            renderMatches();

        }
    );

});


/* =========================================================
   زر التحديث
========================================================= */

if (refreshBtn) {

    refreshBtn.addEventListener(
        "click",
        async function () {

            refreshBtn.disabled = true;

            const oldText =
                refreshBtn.textContent;


            refreshBtn.textContent =
                "⏳ جاري التحديث...";


            await loadAllData();


            refreshBtn.disabled = false;

            refreshBtn.textContent =
                oldText ||
                "🔄 تحديث";

        }
    );

}


/* =========================================================
   تحميل كل البيانات
========================================================= */

async function loadAllData() {

    setConnection(
        "loading"
    );


    try {

        /*
         * نحمل الجداول بشكل مستقل.
         *
         * إذا كان جدول players فيه مشكلة
         * لا نوقف الفرق والمباريات.
         */

        await Promise.all([
            loadTeams(),
            loadMatches(),
            loadPlayers()
        ]);


        updateStatistics();

        renderLiveMatches();

        renderMatches();

        renderTeams();

        renderPlayers();


        dataLoaded = true;


        setConnection(
            "connected"
        );


    } catch (error) {

        console.error(
            "خطأ عام في تحميل الموقع:",
            error
        );


        setConnection(
            "error"
        );

    }

}


/* =========================================================
   تحميل الفرق
========================================================= */

async function loadTeams() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("teams")
                .select("*")
                .order(
                    "name",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "خطأ تحميل جدول teams:",
                error
            );

            teams = [];

            return;

        }


        teams =
            Array.isArray(data)
                ? data
                : [];


    } catch (error) {

        console.error(
            "خطأ غير متوقع في الفرق:",
            error
        );

        teams = [];

    }

}


/* =========================================================
   تحميل المباريات
========================================================= */

async function loadMatches() {

    try {

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
                )
                .order(
                    "match_time",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "خطأ تحميل جدول matches:",
                error
            );

            matches = [];

            return;

        }


        matches =
            Array.isArray(data)
                ? data
                : [];


    } catch (error) {

        console.error(
            "خطأ غير متوقع في المباريات:",
            error
        );

        matches = [];

    }

}


/* =========================================================
   تحميل اللاعبين
========================================================= */

async function loadPlayers() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .from("players")
                .select("*")
                .order(
                    "name",
                    {
                        ascending: true
                    }
                );


        if (error) {

            console.error(
                "خطأ تحميل جدول players:",
                error
            );

            /*
             * لا نوقف الموقع كاملًا
             * بسبب اللاعبين.
             */

            players = [];

            return;

        }


        players =
            Array.isArray(data)
                ? data
                : [];


        console.log(
            "تم تحميل اللاعبين:",
            players.length
        );


    } catch (error) {

        console.error(
            "خطأ غير متوقع في اللاعبين:",
            error
        );

        players = [];

    }

}


/* =========================================================
   الإحصائيات
========================================================= */

function updateStatistics() {

    const live =
        matches.filter(
            isLiveMatch
        );


    if (totalMatches) {

        totalMatches.textContent =
            matches.length;

    }


    if (liveMatches) {

        liveMatches.textContent =
            live.length;

    }


    if (totalTeams) {

        totalTeams.textContent =
            teams.length;

    }


    if (totalPlayers) {

        totalPlayers.textContent =
            players.length;

    }


    if (liveCountBadge) {

        liveCountBadge.textContent =
            live.length +
            " مباشر";

    }


    if (teamsCountBadge) {

        teamsCountBadge.textContent =
            teams.length +
            " فريق";

    }


    if (playersCountBadge) {

        playersCountBadge.textContent =
            players.length +
            " لاعب";

    }

}


/* =========================================================
   المباريات المباشرة
========================================================= */

function renderLiveMatches() {

    if (!liveMatchesContainer) {

        return;

    }


    const live =
        matches.filter(
            isLiveMatch
        );


    if (live.length === 0) {

        liveMatchesContainer.innerHTML = `

            <div class="empty-card">

                <div class="empty-icon">
                    💤
                </div>

                <strong>
                    لا توجد مباريات مباشرة الآن
                </strong>

                <p>
                    ستظهر المباراة هنا تلقائيًا
                    عند تحويل حالتها إلى "مباشرة".
                </p>

            </div>

        `;

        return;

    }


    liveMatchesContainer.innerHTML =
        live
            .map(
                createMatchCard
            )
            .join("");

}


/* =========================================================
   عرض المباريات
========================================================= */

function renderMatches() {

    if (!matchesList) {

        return;

    }


    let list =
        [...matches];


    if (
        currentFilter !==
        "all"
    ) {

        list =
            list.filter(
                function (match) {

                    return (
                        normalizeStatus(
                            match.status
                        ) ===
                        currentFilter
                    );

                }
            );

    }


    /*
     * المباريات المباشرة أولًا.
     */

    list.sort(
        function (a, b) {

            const aLive =
                isLiveMatch(a)
                    ? 0
                    : 1;


            const bLive =
                isLiveMatch(b)
                    ? 0
                    : 1;


            if (
                aLive !==
                bLive
            ) {

                return (
                    aLive -
                    bLive
                );

            }


            return compareMatches(
                a,
                b
            );

        }
    );


    if (list.length === 0) {

        matchesList.innerHTML = `

            <div class="empty-card">

                <div class="empty-icon">
                    ⚽
                </div>

                <strong>
                    لا توجد مباريات
                </strong>

                <p>
                    لا توجد بيانات مطابقة للفترة المحددة.
                </p>

            </div>

        `;

        return;

    }


    matchesList.innerHTML =
        list
            .map(
                createMatchCard
            )
            .join("");

}


/* =========================================================
   مقارنة المباريات
========================================================= */

function compareMatches(
    a,
    b
) {

    const dateA =
        String(
            a.match_date || ""
        );


    const dateB =
        String(
            b.match_date || ""
        );


    if (
        dateA <
        dateB
    ) {

        return -1;

    }


    if (
        dateA >
        dateB
    ) {

        return 1;

    }


    const timeA =
        String(
            a.match_time || ""
        );


    const timeB =
        String(
            b.match_time || ""
        );


    return timeA.localeCompare(
        timeB
    );

}


/* =========================================================
   إنشاء بطاقة المباراة
========================================================= */

function createMatchCard(
    match
) {

    const home =
        getHomeTeamName(
            match
        );


    const away =
        getAwayTeamName(
            match
        );


    const status =
        normalizeStatus(
            match.status
        );


    const homeTeam =
        findTeam(
            home
        );


    const awayTeam =
        findTeam(
            away
        );


    const score =
        getScore(
            match
        );


    const live =
        isLiveMatch(
            match
        );


    const statusClass =
        getStatusClass(
            status
        );


    return `

        <article
            class="match-card"
            data-match-id="${escapeHTML(
                match.id || ""
            )}"
        >

            <div class="match-top">

                <div class="match-date">

                    📅
                    ${escapeHTML(
                        formatDate(
                            match.match_date
                        )
                    )}

                    <br>

                    🕐
                    ${escapeHTML(
                        formatTime(
                            match.match_time
                        )
                    )}

                </div>


                <span
                    class="status ${statusClass}"
                >

                    ${
                        live
                            ? `
                                <span class="live-indicator">

                                    <span class="live-pulse"></span>

                                    مباشر

                                </span>
                              `
                            : escapeHTML(
                                status ||
                                "قادمة"
                            )
                    }

                </span>

            </div>


            <div class="match-teams">


                <div class="match-team">

                    ${createLogo(
                        homeTeam,
                        home
                    )}

                    <div class="match-team-name">

                        ${escapeHTML(
                            home
                        )}

                    </div>

                </div>


                <div class="match-center">

                    <div
                        class="
                            match-score
                            ${
                                score.pending
                                    ? "pending"
                                    : ""
                            }
                        "
                    >

                        ${score.html}

                    </div>

                    ${
                        live
                            ? `
                                <div class="live-small">
                                    🔴 مباشر
                                </div>
                              `
                            : ""
                    }

                </div>


                <div class="match-team">

                    ${createLogo(
                        awayTeam,
                        away
                    )}

                    <div class="match-team-name">

                        ${escapeHTML(
                            away
                        )}

                    </div>

                </div>

            </div>


            <div class="match-meta">

                🏟️
                ${escapeHTML(
                    match.stadium ||
                    "الملعب غير محدد"
                )}

            </div>

        </article>

    `;

}


/* =========================================================
   النتيجة
========================================================= */

function getScore(
    match
) {

    const home =
        getValue(
            match,
            [
                "home_score",
                "homeScore",
                "home_goals"
            ]
        );


    const away =
        getValue(
            match,
            [
                "away_score",
                "awayScore",
                "away_goals"
            ]
        );


    if (
        home === null ||
        home === undefined ||
        home === "" ||
        away === null ||
        away === undefined ||
        away === ""
    ) {

        return {

            pending: true,

            html:
                "لم تبدأ"

        };

    }


    return {

        pending: false,

        html:
            escapeHTML(home) +
            " - " +
            escapeHTML(away)

    };

}


/* =========================================================
   الفرق
========================================================= */

function renderTeams() {

    if (!teamsGrid) {

        return;

    }


    if (
        teams.length === 0
    ) {

        teamsGrid.innerHTML = `

            <div class="empty-card">

                <div class="empty-icon">
                    ⚽
                </div>

                <strong>
                    لا توجد فرق مسجلة حاليًا
                </strong>

                <p>
                    أضف الفرق من لوحة الإدارة.
                </p>

            </div>

        `;

        return;

    }


    teamsGrid.innerHTML =
        teams
            .map(
                createTeamCard
            )
            .join("");


    document.querySelectorAll(
        ".team-card"
    ).forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const id =
                        card.dataset.id;


                    const team =
                        teams.find(
                            function (item) {

                                return String(
                                    item.id
                                ) ===
                                String(id);

                            }
                        );


                    if (team) {

                        showTeamDetails(
                            team
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   بطاقة الفريق
========================================================= */

function createTeamCard(
    team
) {

    const name =
        team.name ||
        "فريق غير معروف";


    const city =
        team.city ||
        "أبين";


    return `

        <article
            class="team-card"
            data-id="${escapeHTML(
                team.id || ""
            )}"
        >

            <div class="team-card-logo">

                ${
                    safeImageUrl(
                        team.logo_url
                    )
                        ? `
                            <img
                                src="${safeImageUrl(
                                    team.logo_url
                                )}"
                                alt="شعار ${escapeHTML(
                                    name
                                )}"
                                loading="lazy"
                                onerror="
                                    this.style.display='none';
                                    this.nextElementSibling.style.display='block';
                                "
                            >

                            <span
                                style="display:none;"
                            >
                                ⚽
                            </span>
                          `
                        : `
                            <span>
                                ⚽
                            </span>
                          `
                }

            </div>


            <h3>

                ${escapeHTML(
                    name
                )}

            </h3>


            <p>

                📍
                ${escapeHTML(
                    city
                )}

            </p>


            <div class="team-card-footer">

                عرض معلومات الفريق
                ←

            </div>

        </article>

    `;

}


/* =========================================================
   اللاعبون
========================================================= */

function renderPlayers() {

    if (!playersGrid) {

        return;

    }


    /*
     * لا نخفي اللاعب إلا إذا كانت قيمة
     * active أو is_active تساوي false صراحة.
     */

    const visiblePlayers =
        players.filter(
            function (player) {

                return (
                    player.active !== false &&
                    player.is_active !== false
                );

            }
        );


    if (
        visiblePlayers.length === 0
    ) {

        playersGrid.innerHTML = `

            <div class="empty-card">

                <div class="empty-icon">
                    👤
                </div>

                <strong>
                    لا توجد بيانات لاعبين
                </strong>

                <p>
                    ${
                        players.length === 0
                            ? "لم يتم العثور على لاعبين في قاعدة البيانات."
                            : "لا يوجد لاعبون نشطون حاليًا."
                    }
                </p>

            </div>

        `;

        return;

    }


    playersGrid.innerHTML =
        visiblePlayers
            .map(
                createPlayerCard
            )
            .join("");


    document.querySelectorAll(
        ".player-card"
    ).forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const id =
                        card.dataset.id;


                    const player =
                        players.find(
                            function (item) {

                                return String(
                                    item.id
                                ) ===
                                String(id);

                            }
                        );


                    if (player) {

                        showPlayerDetails(
                            player
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   بطاقة اللاعب
========================================================= */

function createPlayerCard(
    player
) {

    const playerName =
        player.name ||
        player.full_name ||
        "لاعب";


    const teamName =
        getPlayerTeamName(
            player
        );


    const position =
        player.position ||
        player.role ||
        "لاعب";


    const number =
        getValue(
            player,
            [
                "number",
                "player_number",
                "shirt_number",
                "jersey_number"
            ]
        );


    const photo =
        getPlayerPhoto(
            player
        );


    return `

        <article
            class="player-card"
            data-id="${escapeHTML(
                player.id || ""
            )}"
        >

            <div class="player-photo">

                ${
                    safeImageUrl(
                        photo
                    )
                        ? `
                            <img
                                src="${safeImageUrl(
                                    photo
                                )}"
                                alt="${escapeHTML(
                                    playerName
                                )}"
                                loading="lazy"
                                onerror="
                                    this.style.display='none';
                                    this.nextElementSibling.style.display='block';
                                "
                            >

                            <span
                                class="player-placeholder"
                                style="display:none;"
                            >
                                👤
                            </span>
                          `
                        : `
                            <span class="player-placeholder">
                                👤
                            </span>
                          `
                }

            </div>


            <div class="player-body">

                <h3>

                    ${escapeHTML(
                        playerName
                    )}

                </h3>


                <div class="player-team">

                    ⚽
                    ${escapeHTML(
                        teamName
                    )}

                </div>


                <div class="player-details">

                    <span class="player-tag">

                        ${escapeHTML(
                            position
                        )}

                    </span>


                    ${
                        number !== null &&
                        number !== undefined &&
                        number !== ""
                            ? `
                                <span class="player-tag">

                                    رقم
                                    ${escapeHTML(
                                        number
                                    )}

                                </span>
                              `
                            : ""
                    }

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   تفاصيل الفريق
========================================================= */

function showTeamDetails(
    team
) {

    if (
        !detailsModal ||
        !modalContent
    ) {

        return;

    }


    const teamPlayers =
        players.filter(
            function (player) {

                return normalizeName(
                    getPlayerTeamName(
                        player
                    )
                ) ===
                normalizeName(
                    team.name || ""
                );

            }
        );


    modalContent.innerHTML = `

        <div class="modal-team-head">

            <div class="modal-big-logo">

                ${
                    safeImageUrl(
                        team.logo_url
                    )
                        ? `
                            <img
                                src="${safeImageUrl(
                                    team.logo_url
                                )}"
                                alt="${escapeHTML(
                                    team.name ||
                                    "الفريق"
                                )}"
                            >
                          `
                        : `
                            <span>
                                ⚽
                            </span>
                          `
                }

            </div>


            <h2>

                ${escapeHTML(
                    team.name ||
                    "فريق"
                )}

            </h2>


            <div class="modal-muted">

                📍
                ${escapeHTML(
                    team.city ||
                    "أبين"
                )}

            </div>

        </div>


        <div class="modal-info-grid">


            <div class="modal-info-item">

                <strong>
                    المدرب
                </strong>

                <span>

                    ${escapeHTML(
                        team.coach ||
                        "غير محدد"
                    )}

                </span>

            </div>


            <div class="modal-info-item">

                <strong>
                    سنة التأسيس
                </strong>

                <span>

                    ${escapeHTML(
                        team.founded_year ||
                        "غير محددة"
                    )}

                </span>

            </div>


            <div class="modal-info-item">

                <strong>
                    عدد اللاعبين
                </strong>

                <span>

                    ${teamPlayers.length}

                </span>

            </div>


            <div class="modal-info-item">

                <strong>
                    المدينة
                </strong>

                <span>

                    ${escapeHTML(
                        team.city ||
                        "غير محددة"
                    )}

                </span>

            </div>

        </div>


        ${
            team.description
                ? `
                    <div class="modal-description">

                        <strong>
                            نبذة عن الفريق
                        </strong>

                        <p>

                            ${escapeHTML(
                                team.description
                            )}

                        </p>

                    </div>
                  `
                : ""
        }

    `;


    openModal();

}


/* =========================================================
   تفاصيل اللاعب
========================================================= */

function showPlayerDetails(
    player
) {

    if (
        !detailsModal ||
        !modalContent
    ) {

        return;

    }


    const playerName =
        player.name ||
        player.full_name ||
        "اللاعب";


    const teamName =
        getPlayerTeamName(
            player
        );


    const photo =
        getPlayerPhoto(
            player
        );


    const number =
        getValue(
            player,
            [
                "number",
                "player_number",
                "shirt_number",
                "jersey_number"
            ]
        );


    const position =
        player.position ||
        player.role ||
        "غير محدد";


    const birthDate =
        player.birth_date ||
        player.birthDate ||
        player.date_of_birth;


    modalContent.innerHTML = `

        <div class="modal-player-head">

            <div class="modal-big-logo">

                ${
                    safeImageUrl(
                        photo
                    )
                        ? `
                            <img
                                src="${safeImageUrl(
                                    photo
                                )}"
                                alt="${escapeHTML(
                                    playerName
                                )}"
                            >
                          `
                        : `
                            <span>
                                👤
                            </span>
                          `
                }

            </div>


            <h2>

                ${escapeHTML(
                    playerName
                )}

            </h2>


            <div class="modal-muted">

                ⚽
                ${escapeHTML(
                    teamName
                )}

            </div>

        </div>


        <div class="modal-info-grid">


            <div class="modal-info-item">

                <strong>
                    المركز
                </strong>

                <span>

                    ${escapeHTML(
                        position
                    )}

                </span>

            </div>


            <div class="modal-info-item">

                <strong>
                    رقم القميص
                </strong>

                <span>

                    ${escapeHTML(
                        number ||
                        "غير محدد"
                    )}

                </span>

            </div>


            <div class="modal-info-item">

                <strong>
                    تاريخ الميلاد
                </strong>

                <span>

                    ${escapeHTML(
                        formatDate(
                            birthDate
                        )
                    )}

                </span>

            </div>


            <div class="modal-info-item">

                <strong>
                    الجنسية
                </strong>

                <span>

                    ${escapeHTML(
                        player.nationality ||
                        "غير محددة"
                    )}

                </span>

            </div>


            <div class="modal-info-item">

                <strong>
                    الطول
                </strong>

                <span>

                    ${
                        player.height
                            ? escapeHTML(
                                player.height
                            ) +
                              " سم"
                            : "غير محدد"
                    }

                </span>

            </div>


            <div class="modal-info-item">

                <strong>
                    الوزن
                </strong>

                <span>

                    ${
                        player.weight
                            ? escapeHTML(
                                player.weight
                            ) +
                              " كجم"
                            : "غير محدد"
                    }

                </span>

            </div>


            <div class="modal-info-item">

                <strong>
                    القدم المفضلة
                </strong>

                <span>

                    ${escapeHTML(
                        player.foot ||
                        player.preferred_foot ||
                        "غير محددة"
                    )}

                </span>

            </div>

        </div>


        ${
            player.bio ||
            player.description
                ? `
                    <div class="modal-description">

                        <strong>
                            نبذة عن اللاعب
                        </strong>

                        <p>

                            ${escapeHTML(
                                player.bio ||
                                player.description
                            )}

                        </p>

                    </div>
                  `
                : ""
        }

    `;


    openModal();

}


/* =========================================================
   فتح النافذة
========================================================= */

function openModal() {

    if (!detailsModal) {

        return;

    }


    detailsModal.classList.remove(
        "hidden"
    );


    detailsModal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   إغلاق النافذة
========================================================= */

function closeModal() {

    if (!detailsModal) {

        return;

    }


    detailsModal.classList.add(
        "hidden"
    );


    detailsModal.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


/* =========================================================
   زر إغلاق النافذة
========================================================= */

if (closeModalBtn) {

    closeModalBtn.addEventListener(
        "click",
        closeModal
    );

}


/* =========================================================
   الضغط على خلفية النافذة
========================================================= */

const modalOverlay =
    document.querySelector(
        ".modal-overlay"
    );


if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        closeModal
    );

}


/* =========================================================
   زر ESC
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeModal();

        }

    }
);


/* =========================================================
   البحث عن الفريق
========================================================= */

function findTeam(
    teamName
) {

    const normalized =
        normalizeName(
            teamName
        );


    return (
        teams.find(
            function (team) {

                return (
                    normalizeName(
                        team.name
                    ) ===
                    normalized
                );

            }
        ) ||
        null
    );

}


/* =========================================================
   اسم الفريق المضيف
========================================================= */

function getHomeTeamName(
    match
) {

    return (
        match.home_team ||
        match.homeTeam ||
        match.home_team_name ||
        "الفريق المضيف"
    );

}


/* =========================================================
   اسم الفريق الضيف
========================================================= */

function getAwayTeamName(
    match
) {

    return (
        match.away_team ||
        match.awayTeam ||
        match.away_team_name ||
        "الفريق الضيف"
    );

}


/* =========================================================
   اسم فريق اللاعب
========================================================= */

function getPlayerTeamName(
    player
) {

    if (
        player.team_name
    ) {

        return String(
            player.team_name
        );

    }


    if (
        player.team
    ) {

        if (
            typeof player.team ===
            "object"
        ) {

            return (
                player.team.name ||
                "غير محدد"
            );

        }


        return String(
            player.team
        );

    }


    if (
        player.team_id
    ) {

        const team =
            teams.find(
                function (item) {

                    return (
                        String(
                            item.id
                        ) ===
                        String(
                            player.team_id
                        )
                    );

                }
            );


        return team
            ? team.name
            : "غير محدد";

    }


    return "غير محدد";

}


/* =========================================================
   صورة اللاعب
========================================================= */

function getPlayerPhoto(
    player
) {

    return (
        player.photo_url ||
        player.photo ||
        player.image_url ||
        player.image ||
        player.avatar_url ||
        ""
    );

}


/* =========================================================
   شعار الفريق
========================================================= */

function createLogo(
    team,
    name
) {

    if (
        team &&
        safeImageUrl(
            team.logo_url
        )
    ) {

        return `

            <div class="team-logo">

                <img
                    src="${safeImageUrl(
                        team.logo_url
                    )}"
                    alt="شعار ${escapeHTML(
                        name
                    )}"
                    loading="lazy"
                    onerror="
                        this.style.display='none';
                        this.nextElementSibling.style.display='block';
                    "
                >

                <span
                    style="display:none;"
                >
                    ⚽
                </span>

            </div>

        `;

    }


    return `

        <div class="team-logo">

            <span>
                ⚽
            </span>

        </div>

    `;

}


/* =========================================================
   توحيد حالة المباراة
========================================================= */

function normalizeStatus(
    status
) {

    const value =
        String(
            status || ""
        )
        .trim()
       
