/* =========================================================
   أبيان سبورت
   app.js

   الواجهة الرئيسية
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
   العناصر
========================================================= */

const connectionStatus =
    document.getElementById(
        "connectionStatus"
    );


const totalMatches =
    document.getElementById(
        "totalMatches"
    );


const liveMatchesCount =
    document.getElementById(
        "liveMatches"
    );


const totalTeams =
    document.getElementById(
        "totalTeams"
    );


const totalPlayers =
    document.getElementById(
        "totalPlayers"
    );


const liveMatchesContainer =
    document.getElementById(
        "liveMatches"
    );


const matchesList =
    document.getElementById(
        "matchesList"
    );


const teamsGrid =
    document.getElementById(
        "teamsGrid"
    );


const playersGrid =
    document.getElementById(
        "playersGrid"
    );


const liveCountBadge =
    document.getElementById(
        "liveCountBadge"
    );


const teamsCountBadge =
    document.getElementById(
        "teamsCountBadge"
    );


const playersCountBadge =
    document.getElementById(
        "playersCountBadge"
    );


const refreshBtn =
    document.getElementById(
        "refreshBtn"
    );


const menuBtn =
    document.getElementById(
        "menuBtn"
    );


const mainNav =
    document.getElementById(
        "mainNav"
    );


const detailsModal =
    document.getElementById(
        "detailsModal"
    );


const modalContent =
    document.getElementById(
        "modalContent"
    );


const closeModalBtn =
    document.getElementById(
        "closeModalBtn"
    );


/* =========================================================
   بيانات التطبيق
========================================================= */

let teams = [];

let matches = [];

let players = [];

let currentFilter = "all";


/* =========================================================
   تشغيل القائمة
========================================================= */

if (menuBtn) {

    menuBtn.addEventListener(
        "click",
        function () {

            mainNav.classList.toggle(
                "open"
            );

        }
    );

}


document.querySelectorAll(
    ".nav-link"
).forEach(function (link) {

    link.addEventListener(
        "click",
        function () {

            mainNav.classList.remove(
                "open"
            );

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
            ).forEach(function (btn) {

                btn.classList.remove(
                    "active"
                );

            });


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

            refreshBtn.textContent =
                "⏳ جاري التحديث...";


            await loadAllData();


            refreshBtn.disabled = false;

            refreshBtn.textContent =
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


        setConnection(
            "connected"
        );


    } catch (error) {

        console.error(
            "خطأ تحميل البيانات:",
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

    const result =
        await supabaseClient
            .from("teams")
            .select("*")
            .order(
                "name",
                {
                    ascending: true
                }
            );


    if (result.error) {

        console.error(
            "خطأ تحميل الفرق:",
            result.error
        );


        teams = [];

        return;

    }


    teams =
        Array.isArray(result.data)
            ? result.data
            : [];

}


/* =========================================================
   تحميل المباريات
========================================================= */

async function loadMatches() {

    const result =
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


    if (result.error) {

        console.error(
            "خطأ تحميل المباريات:",
            result.error
        );


        matches = [];

        return;

    }


    matches =
        Array.isArray(result.data)
            ? result.data
            : [];

}


/* =========================================================
   تحميل اللاعبين
========================================================= */

async function loadPlayers() {

    const result =
        await supabaseClient
            .from("players")
            .select("*")
            .order(
                "name",
                {
                    ascending: true
                }
            );


    if (result.error) {

        console.error(
            "تعذر تحميل اللاعبين:",
            result.error
        );


        /*
         * إذا لم يكن جدول players موجودًا
         * لا نكسر بقية الموقع.
         */

        players = [];

        return;

    }


    players =
        Array.isArray(result.data)
            ? result.data
            : [];

}


/* =========================================================
   الإحصائيات
========================================================= */

function updateStatistics() {

    const live =
        matches.filter(
            isLiveMatch
        );


    totalMatches.textContent =
        matches.length;


    liveMatchesCount.textContent =
        live.length;


    totalTeams.textContent =
        teams.length;


    totalPlayers.textContent =
        players.length;


    liveCountBadge.textContent =
        live.length +
        " مباشر";


    teamsCountBadge.textContent =
        teams.length +
        " فريق";


    playersCountBadge.textContent =
        players.length +
        " لاعب";

}


/* =========================================================
   المباريات المباشرة
========================================================= */

function renderLiveMatches() {

    const live =
        matches.filter(
            isLiveMatch
        );


    if (live.length === 0) {

        liveMatchesContainer.innerHTML = `

            <div class="empty-card">

                <div style="font-size:40px;">
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

    let list = [
        ...matches
    ];


    if (
        currentFilter !==
        "all"
    ) {

        list =
            list.filter(
                function (match) {

                    return normalizeStatus(
                        match.status
                    ) ===
                    currentFilter;

                }
            );

    }


    /*
     * المباريات المباشرة أولًا
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


            if (aLive !== bLive) {

                return aLive - bLive;

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

                <div style="font-size:45px;">
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


    if (dateA < dateB) {

        return -1;

    }


    if (dateA > dateB) {

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
   إنشاء بطاقة مباراة
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


    const statusClass =
        getStatusClass(
            status
        );


    const score =
        getScore(
            match
        );


    const live =
        isLiveMatch(
            match
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

                    ${formatDate(
                        match.match_date
                    )}

                    ${formatTime(
                        match.match_time
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
                                status || "قادمة"
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


                <div>

                    <div
                        class="match-score
                        ${
                            score.pending
                                ? "pending"
                                : ""
                        }"
                    >

                        ${score.html}

                    </div>

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

                📅
                ${formatDate(
                    match.match_date
                )}

                &nbsp; • &nbsp;

                🕐
                ${formatTime(
                    match.match_time
                )}

                <br>

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
            escapeHTML(
                home
            ) +
            " - " +
            escapeHTML(
                away
            )

    };

}


/* =========================================================
   الفرق
========================================================= */

function renderTeams() {

    if (teams.length === 0) {

        teamsGrid.innerHTML = `

            <div class="empty-card">

                ⚽

                <br>

                لا توجد فرق مسجلة حاليًا.

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
    ).forEach(function (card) {

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

    });

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


    return `

        <article
            class="team-card"
            data-id="${escapeHTML(
                team.id || ""
            )}"
        >

            <div class="team-card-logo">

                ${
                    team.logo_url
                        ? `
                            <img
                                src="${safeImageUrl(
                                    team.logo_url
                                )}"
                                alt="شعار ${escapeHTML(
                                    name
                                )}"
                                loading="lazy"
                                onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
                            >

                            <span style="display:none;">
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

                ${escapeHTML(
                    team.city ||
                    "أبين"
                )}

            </p>


            <div class="team-card-footer">

                عرض معلومات الفريق ←

            </div>

        </article>

    `;

}


/* =========================================================
   اللاعبون
========================================================= */

function renderPlayers() {

    /*
     * عرض اللاعبين النشطين أولًا
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

                <div style="font-size:45px;">
                    👤
                </div>

                <strong>
                    لا توجد بيانات لاعبين
                </strong>

                <p>
                    ستظهر بيانات اللاعبين هنا بعد إضافتهم من لوحة الإدارة.
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
    ).forEach(function (card) {

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

    });

}


/* =========================================================
   بطاقة اللاعب
========================================================= */

function createPlayerCard(
    player
) {

    const teamName =
        getPlayerTeamName(
            player
        );


    const position =
        player.position ||
        "لاعب";


    const number =
        getValue(
            player,
            [
                "number",
                "player_number",
                "shirt_number"
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
                    photo
                        ? `
                            <img
                                src="${safeImageUrl(
                                    photo
                                )}"
                                alt="${escapeHTML(
                                    player.name ||
                                    "اللاعب"
                                )}"
                                loading="lazy"
                                onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
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
                        player.name ||
                        "لاعب"
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

                                    رقم ${escapeHTML(
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

    const teamPlayers =
        players.filter(
            function (player) {

                return (
                    getPlayerTeamName(
                        player
                    ) ===
                    String(
                        team.name || ""
                    )
                );

            }
        );


    modalContent.innerHTML = `

        <div class="modal-team-head">

            <div class="modal-big-logo">

                ${
                    team.logo_url
                        ? `
                            <img
                                src="${safeImageUrl(
                                    team.logo_url
                                )}"
                                alt="${escapeHTML(
                                    team.name
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
                    <div
                        style="
                            margin-top:20px;
                            color:#475569;
                        "
                    >

                        <strong>
                            نبذة
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
                "shirt_number"
            ]
        );


    const position =
        player.position ||
        "غير محدد";


    modalContent.innerHTML = `

        <div class="modal-player-head">

            <div class="modal-big-logo">

                ${
                    photo
                        ? `
                            <img
                                src="${safeImageUrl(
                                    photo
                                )}"
                                alt="${escapeHTML(
                                    player.name ||
                                    "اللاعب"
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
                    player.name ||
                    "اللاعب"
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

                    ${formatDate(
                        player.birth_date ||
                        player.birthDate
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
            player.bio
                ? `
                    <div
                        style="
                            margin-top:20px;
                            color:#475569;
                        "
                    >

                        <strong>
                            نبذة عن اللاعب
                        </strong>

                        <p>

                            ${escapeHTML(
                                player.bio
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
   فتح وإغلاق النافذة
========================================================= */

function openModal() {

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


function closeModal() {

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


closeModalBtn.addEventListener(
    "click",
    closeModal
);


document.querySelector(
    ".modal-overlay"
).addEventListener(
    "click",
    closeModal
);


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


    return teams.find(
        function (team) {

            return (
                normalizeName(
                    team.name
                ) ===
                normalized
            );

        }
    ) || null;

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

        return player.team_name;

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


        return player.team;

    }


    if (
        player.team_id
    ) {

        const team =
            teams.find(
                function (item) {

                    return String(
                        item.id
                    ) ===
                    String(
                        player.team_id
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
        team.logo_url
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
                    onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
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
   الحالة
========================================================= */

function normalizeStatus(
    status
) {

    const value =
        String(
            status || ""
        ).trim();


    if (
        value === "live" ||
        value === "LIVE" ||
        value === "مباشرة"
    ) {

        return "مباشرة";

    }


    if (
        value === "finished" ||
        value === "FINISHED" ||
        value === "انتهت"
    ) {

        return "انتهت";

    }


    if (
        value === "upcoming" ||
        value === "UPCOMING" ||
        value === "قادمة"
    ) {

        return "قادمة";

    }


    return value || "قادمة";

}


/* =========================================================
   هل المباراة مباشرة؟
========================================================= */

function isLiveMatch(
    match
) {

    return (
        normalizeStatus(
            match.status
        ) ===
        "مباشرة"
    );

}


/* =========================================================
   CSS الحالة
========================================================= */

function getStatusClass(
    status
) {

    if (
        status ===
        "مباشرة"
    ) {

        return "status-live";

    }


    if (
        status ===
        "انتهت"
    ) {

        return "status-finished";

    }


    if (
        status ===
        "قادمة"
    ) {

        return "status-upcoming";

    }


    return "";

}


/* =========================================================
   التاريخ
========================================================= */

function formatDate(
    value
) {

    if (!value) {

        return "غير محدد";

    }


    const text =
        String(value);


    const parts =
        text.split("-");


    if (
        parts.length ===
        3
    ) {

        return (
            parts[2] +
            "-" +
            parts[1] +
            "-" +
            parts[0]
        );

    }


    return text;

}


/* =========================================================
   الوقت
========================================================= */

function formatTime(
    value
) {

    if (!value) {

        return "غير محدد";

    }


    const text =
        String(value);


    if (
        text.length >= 5
    ) {

        return text.substring(
            0,
            5
        );

    }


    return text;

}


/* =========================================================
   البحث عن قيمة بعدة أسماء
========================================================= */

function getValue(
    object,
    keys
) {

    for (
        let i = 0;
        i < keys.length;
        i++
    ) {

        const key =
            keys[i];


        if (
            object &&
            Object.prototype.hasOwnProperty.call(
                object,
                key
            )
        ) {

            return object[key];

        }

    }


    return null;

}


/* =========================================================
   توحيد الأسماء
========================================================= */

function normalizeName(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .replace(
            /\s+/g,
            " "
        );

}


/* =========================================================
   حماية HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   حماية الصور والروابط
========================================================= */

function safeImageUrl(
    value
) {

    const url =
        String(
            value || ""
        ).trim();


    /*
     * نسمح بروابط HTTP/HTTPS فقط.
     */

    if (
        /^https?:\/\//i.test(
            url
        )
    ) {

        return escapeHTML(
            url
        );

    }


    return "";

}


/* =========================================================
   حالة الاتصال
========================================================= */

function setConnection(
    state
) {

    if (
        state ===
        "connected"
    ) {

        connectionStatus.innerHTML = `

            <span class="connection-dot"></span>

            متصل بقاعدة البيانات

        `;

        return;

    }


    if (
        state ===
        "error"
    ) {

        connectionStatus.innerHTML = `

            <span
                class="connection-dot"
                style="background:#dc2626;"
            ></span>

            تعذر تحميل بعض البيانات من قاعدة البيانات

        `;

        return;

    }


    connectionStatus.innerHTML = `

        <span
            class="connection-dot"
            style="background:#f59e0b;"
        ></span>

        جاري الاتصال بقاعدة البيانات...

    `;

}


/* =========================================================
   تحديث تلقائي
========================================================= */

/*
 * يتم تحديث البيانات كل 10 ثوانٍ.
 *
 * هذا مهم للمباريات المباشرة والنتائج.
 */

setInterval(
    async function () {

        await loadAllData();

    },
    10000
);


/* =========================================================
   تشغيل التطبيق
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadAllData();

    }
);
