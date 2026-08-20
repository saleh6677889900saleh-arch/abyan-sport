/* =========================================================
   أبيان سبورت
   js/admin.js

   لوحة تحكم المدير
   - المباريات
   - الفرق
   - اللاعبين
   - الإحصائيات
   - إضافة / تعديل / حذف
   - تحديث تلقائي
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
   بيانات التطبيق
========================================================= */

let teams = [];
let matches = [];
let players = [];

let editingTeamId = null;
let editingMatchId = null;
let editingPlayerId = null;


/* =========================================================
   تشغيل
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeAdmin();

    }
);


/* =========================================================
   تهيئة لوحة التحكم
========================================================= */

async function initializeAdmin() {

    bindEvents();

    await loadAllData();

}


/* =========================================================
   ربط الأحداث
========================================================= */

function bindEvents() {


    /* =========================
       الأزرار العامة
    ========================= */

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            async function () {

                await loadAllData();

            }
        );

    }


    /* =========================
       زر القائمة
    ========================= */

    const menuBtn =
        document.getElementById(
            "menuBtn"
        );

    const mainNav =
        document.getElementById(
            "mainNav"
        );

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


    /* =========================
       نماذج الفرق
    ========================= */

    const teamForm =
        document.getElementById(
            "teamForm"
        );

    if (teamForm) {

        teamForm.addEventListener(
            "submit",
            handleTeamSubmit
        );

    }


    /* =========================
       نماذج المباريات
    ========================= */

    const matchForm =
        document.getElementById(
            "matchForm"
        );

    if (matchForm) {

        matchForm.addEventListener(
            "submit",
            handleMatchSubmit
        );

    }


    /* =========================
       نماذج اللاعبين
    ========================= */

    const playerForm =
        document.getElementById(
            "playerForm"
        );

    if (playerForm) {

        playerForm.addEventListener(
            "submit",
            handlePlayerSubmit
        );

    }


    /* =========================
       أزرار الإلغاء
    ========================= */

    document
        .querySelectorAll(
            "[data-cancel]"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const type =
                            button.dataset.cancel;

                        if (
                            type ===
                            "team"
                        ) {

                            resetTeamForm();

                        }

                        if (
                            type ===
                            "match"
                        ) {

                            resetMatchForm();

                        }

                        if (
                            type ===
                            "player"
                        ) {

                            resetPlayerForm();

                        }

                    }
                );

            }
        );


    /* =========================
       إغلاق النوافذ
    ========================= */

    document
        .querySelectorAll(
            ".modal-close"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    closeAllModals
                );

            }
        );


    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            function (overlay) {

                overlay.addEventListener(
                    "click",
                    closeAllModals
                );

            }
        );

}


/* =========================================================
   تحميل جميع البيانات
========================================================= */

async function loadAllData() {

    setAdminStatus(
        "loading"
    );


    try {

        await Promise.all([
            loadTeams(),
            loadMatches(),
            loadPlayers()
        ]);


        updateStatistics();

        renderTeams();

        renderMatches();

        renderPlayers();

        updateTeamSelects();

        setAdminStatus(
            "connected"
        );


    } catch (error) {

        console.error(
            "خطأ تحميل البيانات:",
            error
        );


        setAdminStatus(
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

        throw result.error;

    }


    teams =
        Array.isArray(
            result.data
        )
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

        throw result.error;

    }


    matches =
        Array.isArray(
            result.data
        )
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
            "خطأ تحميل اللاعبين:",
            result.error
        );

        players = [];

        throw result.error;

    }


    players =
        Array.isArray(
            result.data
        )
            ? result.data
            : [];

}


/* =========================================================
   الإحصائيات
========================================================= */

function updateStatistics() {

    setText(
        "totalTeams",
        teams.length
    );

    setText(
        "totalMatches",
        matches.length
    );

    setText(
        "totalPlayers",
        players.length
    );


    const liveMatches =
        matches.filter(
            function (match) {

                return isLiveMatch(
                    match
                );

            }
        );


    setText(
        "liveMatches",
        liveMatches.length
    );


    setText(
        "teamsCount",
        teams.length
    );

    setText(
        "matchesCount",
        matches.length
    );

    setText(
        "playersCount",
        players.length
    );

}


/* =========================================================
   عرض الفرق
========================================================= */

function renderTeams() {

    const container =
        document.getElementById(
            "teamsList"
        ) ||
        document.getElementById(
            "teamsGrid"
        );


    if (!container) {
        return;
    }


    if (
        teams.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-card">

                <div>
                    ⚽
                </div>

                <strong>
                    لا توجد فرق
                </strong>

                <p>
                    أضف أول فريق من النموذج أعلاه.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        teams
            .map(
                createAdminTeamCard
            )
            .join("");

}


/* =========================================================
   بطاقة الفريق في الإدارة
========================================================= */

function createAdminTeamCard(
    team
) {

    const playerCount =
        players.filter(
            function (player) {

                return String(
                    player.team_id || ""
                ) ===
                String(
                    team.id || ""
                );

            }
        ).length;


    return `

        <article
            class="admin-card team-admin-card"
        >

            <div class="admin-card-logo">

                ${
                    team.logo_url
                        ? `
                            <img
                                src="${safeImageUrl(
                                    team.logo_url
                                )}"
                                alt="شعار ${escapeHTML(
                                    team.name
                                )}"
                                onerror="this.style.display='none';"
                            >
                          `
                        : `
                            <span>
                                ⚽
                            </span>
                          `
                }

            </div>


            <div class="admin-card-content">

                <h3>
                    ${escapeHTML(
                        team.name ||
                        "فريق"
                    )}
                </h3>


                <p>

                    📍
                    ${escapeHTML(
                        team.city ||
                        "أبين"
                    )}

                </p>


                <p>

                    👤
                    ${playerCount}
                    لاعب

                </p>


                <div class="admin-card-actions">

                    <button
                        type="button"
                        class="edit-btn"
                        onclick="editTeam('${escapeJS(
                            team.id
                        )}')"
                    >
                        ✏️ تعديل
                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                        onclick="deleteTeam('${escapeJS(
                            team.id
                        )}')"
                    >
                        🗑️ حذف
                    </button>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   عرض المباريات
========================================================= */

function renderMatches() {

    const container =
        document.getElementById(
            "matchesList"
        ) ||
        document.getElementById(
            "matchesGrid"
        );


    if (!container) {
        return;
    }


    if (
        matches.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-card">

                <div>
                    🏆
                </div>

                <strong>
                    لا توجد مباريات
                </strong>

            </div>

        `;

        return;

    }


    container.innerHTML =
        matches
            .map(
                createAdminMatchCard
            )
            .join("");

}


/* =========================================================
   بطاقة المباراة
========================================================= */

function createAdminMatchCard(
    match
) {

    const live =
        isLiveMatch(
            match
        );


    const status =
        normalizeStatus(
            match.status
        );


    return `

        <article
            class="admin-card match-admin-card"
        >

            <div class="admin-match-header">

                <span
                    class="status ${getStatusClass(
                        status
                    )}"
                >

                    ${escapeHTML(
                        status
                    )}

                </span>


                <span>

                    ${formatDate(
                        match.match_date
                    )}

                    -

                    ${formatTime(
                        match.match_time
                    )}

                </span>

            </div>


            <div class="admin-match-teams">

                <strong>

                    ${escapeHTML(
                        match.home_team ||
                        "الفريق المضيف"
                    )}

                </strong>


                <span class="admin-score">

                    ${
                        match.home_score === null ||
                        match.home_score === undefined ||
                        match.away_score === null ||
                        match.away_score === undefined
                            ? "لم تبدأ"
                            :
                            escapeHTML(
                                match.home_score
                            ) +
                            " - " +
                            escapeHTML(
                                match.away_score
                            )
                    }

                </span>


                <strong>

                    ${escapeHTML(
                        match.away_team ||
                        "الفريق الضيف"
                    )}

                </strong>

            </div>


            <div class="admin-match-info">

                🏟️

                ${escapeHTML(
                    match.stadium ||
                    "الملعب غير محدد"
                )}

            </div>


            ${
                live
                    ? `
                        <div class="live-admin-note">
                            🔴 المباراة مباشرة الآن
                        </div>
                      `
                    : ""
            }


            <div class="admin-card-actions">

                <button
                    type="button"
                    class="edit-btn"
                    onclick="editMatch('${escapeJS(
                        match.id
                    )}')"
                >
                    ✏️ تعديل
                </button>


                <button
                    type="button"
                    class="delete-btn"
                    onclick="deleteMatch('${escapeJS(
                        match.id
                    )}')"
                >
                    🗑️ حذف
                </button>

            </div>

        </article>

    `;

}


/* =========================================================
   عرض اللاعبين
========================================================= */

function renderPlayers() {

    const container =
        document.getElementById(
            "playersList"
        ) ||
        document.getElementById(
            "playersGrid"
        );


    if (!container) {
        return;
    }


    if (
        players.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-card">

                <div>
                    👤
                </div>

                <strong>
                    لا يوجد لاعبين
                </strong>

                <p>
                    أضف أول لاعب من نموذج اللاعبين.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        players
            .map(
                createAdminPlayerCard
            )
            .join("");

}


/* =========================================================
   بطاقة اللاعب
========================================================= */

function createAdminPlayerCard(
    player
) {

    const teamName =
        getPlayerTeamName(
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


    const photo =
        getPlayerPhoto(
            player
        );


    return `

        <article
            class="admin-card player-admin-card"
        >

            <div class="admin-player-photo">

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
                                onerror="this.style.display='none';"
                            >
                          `
                        : `
                            <span>
                                👤
                            </span>
                          `
                }

            </div>


            <div class="admin-card-content">

                <h3>

                    ${escapeHTML(
                        player.name ||
                        "لاعب"
                    )}

                </h3>


                <p>

                    ⚽

                    ${escapeHTML(
                        teamName
                    )}

                </p>


                <p>

                    📌

                    ${escapeHTML(
                        player.position ||
                        "غير محدد"
                    )}

                </p>


                ${
                    number !== null &&
                    number !== undefined &&
                    number !== ""
                        ? `
                            <p>
                                👕 رقم
                                ${escapeHTML(
                                    number
                                )}
                            </p>
                          `
                        : ""
                }


                <div class="admin-card-actions">

                    <button
                        type="button"
                        class="edit-btn"
                        onclick="editPlayer('${escapeJS(
                            player.id
                        )}')"
                    >
                        ✏️ تعديل
                    </button>


                    <button
                        type="button"
                        class="delete-btn"
                        onclick="deletePlayer('${escapeJS(
                            player.id
                        )}')"
                    >
                        🗑️ حذف
                    </button>

                </div>

            </div>

        </article>

    `;

}


/* =========================================================
   إضافة / تعديل فريق
========================================================= */

async function handleTeamSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const data = {

        name:
            getFormValue(
                form,
                "name"
            ),

        logo_url:
            getFormValue(
                form,
                "logo_url"
            ),

        city:
            getFormValue(
                form,
                "city"
            ),

        coach:
            getFormValue(
                form,
                "coach"
            ),

        founded_year:
            getFormValue(
                form,
                "founded_year"
            ) || null,

        description:
            getFormValue(
                form,
                "description"
            )

    };


    if (!data.name) {

        showMessage(
            "اكتب اسم الفريق أولًا.",
            "error"
        );

        return;

    }


    setFormLoading(
        form,
        true
    );


    try {

        let result;


        if (
            editingTeamId
        ) {

            result =
                await supabaseClient
                    .from("teams")
                    .update(data)
                    .eq(
                        "id",
                        editingTeamId
                    );

        } else {

            result =
                await supabaseClient
                    .from("teams")
                    .insert(
                        [data]
                    );

        }


        if (result.error) {

            throw result.error;

        }


        showMessage(
            editingTeamId
                ? "تم تعديل الفريق بنجاح."
                : "تمت إضافة الفريق بنجاح.",
            "success"
        );


        resetTeamForm();

        await loadAllData();


    } catch (error) {

        console.error(
            "خطأ حفظ الفريق:",
            error
        );


        showMessage(
            getSupabaseErrorMessage(
                error
            ),
            "error"
        );

    } finally {

        setFormLoading(
            form,
            false
        );

    }

}


/* =========================================================
   تعديل فريق
========================================================= */

window.editTeam =
    async function (id) {

        const team =
            teams.find(
                function (item) {

                    return String(
                        item.id
                    ) ===
                    String(id);

                }
            );


        if (!team) {

            return;

        }


        editingTeamId =
            team.id;


        const form =
            document.getElementById(
                "teamForm"
            );


        if (!form) {

            return;

        }


        setFormValue(
            form,
            "name",
            team.name
        );

        setFormValue(
            form,
            "logo_url",
            team.logo_url
        );

        setFormValue(
            form,
            "city",
            team.city
        );

        setFormValue(
            form,
            "coach",
            team.coach
        );

        setFormValue(
            form,
            "founded_year",
            team.founded_year
        );

        setFormValue(
            form,
            "description",
            team.description
        );


        setSubmitText(
            form,
            "💾 حفظ التعديل"
        );


        scrollToForm(
            form
        );

    };


/* =========================================================
   حذف فريق
========================================================= */

window.deleteTeam =
    async function (id) {

        const team =
            teams.find(
                function (item) {

                    return String(
                        item.id
                    ) ===
                    String(id);

                }
            );


        if (!team) {

            return;

        }


        const confirmed =
            window.confirm(
                "هل أنت متأكد من حذف الفريق: " +
                team.name +
                " ؟"
            );


        if (!confirmed) {

            return;

        }


        try {

            const result =
                await supabaseClient
                    .from("teams")
                    .delete()
                    .eq(
                        "id",
                        id
                    );


            if (result.error) {

                throw result.error;

            }


            showMessage(
                "تم حذف الفريق.",
                "success"
            );


            await loadAllData();


        } catch (error) {

            console.error(
                "خطأ حذف الفريق:",
                error
            );


            showMessage(
                getSupabaseErrorMessage(
                    error
                ),
                "error"
            );

        }

    };


/* =========================================================
   إضافة / تعديل مباراة
========================================================= */

async function handleMatchSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const data = {

        home_team:
            getFormValue(
                form,
                "home_team"
            ),

        away_team:
            getFormValue(
                form,
                "away_team"
            ),

        match_date:
            getFormValue(
                form,
                "match_date"
            ),

        match_time:
            getFormValue(
                form,
                "match_time"
            ),

        stadium:
            getFormValue(
                form,
                "stadium"
            ),

        status:
            normalizeStatus(
                getFormValue(
                    form,
                    "status"
                )
            ),

        home_score:
            toNullableNumber(
                getFormValue(
                    form,
                    "home_score"
                )
            ),

        away_score:
            toNullableNumber(
                getFormValue(
                    form,
                    "away_score"
                )
            )

    };


    if (
        !data.home_team ||
        !data.away_team
    ) {

        showMessage(
            "حدد الفريق المضيف والضيف.",
            "error"
        );

        return;

    }


    setFormLoading(
        form,
        true
    );


    try {

        let result;


        if (
            editingMatchId
        ) {

            result =
                await supabaseClient
                    .from("matches")
                    .update(data)
                    .eq(
                        "id",
                        editingMatchId
                    );

        } else {

            result =
                await supabaseClient
                    .from("matches")
                    .insert(
                        [data]
                    );

        }


        if (result.error) {

            throw result.error;

        }


        showMessage(
            editingMatchId
                ? "تم تعديل المباراة."
                : "تمت إضافة المباراة.",
            "success"
        );


        resetMatchForm();

        await loadAllData();


    } catch (error) {

        console.error(
            "خطأ حفظ المباراة:",
            error
        );


        showMessage(
            getSupabaseErrorMessage(
                error
            ),
            "error"
        );

    } finally {

        setFormLoading(
            form,
            false
        );

    }

}


/* =========================================================
   تعديل مباراة
========================================================= */

window.editMatch =
    function (id) {

        const match =
            matches.find(
                function (item) {

                    return String(
                        item.id
                    ) ===
                    String(id);

                }
            );


        if (!match) {

            return;

        }


        editingMatchId =
            match.id;


        const form =
            document.getElementById(
                "matchForm"
            );


        if (!form) {

            return;

        }


        setFormValue(
            form,
            "home_team",
            match.home_team
        );

        setFormValue(
            form,
            "away_team",
            match.away_team
        );

        setFormValue(
            form,
            "match_date",
            match.match_date
        );

        setFormValue(
            form,
            "match_time",
            match.match_time
        );

        setFormValue(
            form,
            "stadium",
            match.stadium
        );

        setFormValue(
            form,
            "status",
            normalizeStatus(
                match.status
            )
        );

        setFormValue(
            form,
            "home_score",
            match.home_score
        );

        setFormValue(
            form,
            "away_score",
            match.away_score
        );


        setSubmitText(
            form,
            "💾 حفظ تعديل المباراة"
        );


        scrollToForm(
            form
        );

    };


/* =========================================================
   حذف مباراة
========================================================= */

window.deleteMatch =
    async function (id) {

        const confirmed =
            window.confirm(
                "هل أنت متأكد من حذف هذه المباراة؟"
            );


        if (!confirmed) {

            return;

        }


        try {

            const result =
                await supabaseClient
                    .from("matches")
                    .delete()
                    .eq(
                        "id",
                        id
                    );


            if (result.error) {

                throw result.error;

            }


            showMessage(
                "تم حذف المباراة.",
                "success"
            );


            await loadAllData();


        } catch (error) {

            console.error(
                "خطأ حذف المباراة:",
                error
            );


            showMessage(
                getSupabaseErrorMessage(
                    error
                ),
                "error"
            );

        }

    };


/* =========================================================
   إضافة / تعديل لاعب
========================================================= */

async function handlePlayerSubmit(
    event
) {

    event.preventDefault();


    const form =
        event.currentTarget;


    const teamId =
        getFormValue(
            form,
            "team_id"
        );


    const data = {

        name:
            getFormValue(
                form,
                "name"
            ),

        team_id:
            teamId || null,

        position:
            getFormValue(
                form,
                "position"
            ),

        number:
            toNullableNumber(
                getFormValue(
                    form,
                    "number"
                )
            ),

        photo_url:
            getFormValue(
                form,
                "photo_url"
            ),

        birth_date:
            getFormValue(
                form,
                "birth_date"
            ) || null,

        nationality:
            getFormValue(
                form,
                "nationality"
            ),

        height:
            toNullableNumber(
                getFormValue(
                    form,
                    "height"
                )
            ),

        weight:
            toNullableNumber(
                getFormValue(
                    form,
                    "weight"
                )
            ),

        foot:
            getFormValue(
                form,
                "foot"
            ),

        bio:
            getFormValue(
                form,
                "bio"
            ),

        active:
            getCheckboxValue(
                form,
                "active",
                true
            )

    };


    if (!data.name) {

        showMessage(
            "اكتب اسم اللاعب أولًا.",
            "error"
        );

        return;

    }


    setFormLoading(
        form,
        true
    );


    try {

        let result;


        if (
            editingPlayerId
        ) {

            result =
                await supabaseClient
                    .from("players")
                    .update(data)
                    .eq(
                        "id",
                        editingPlayerId
                    );

        } else {

            result =
                await supabaseClient
                    .from("players")
                    .insert(
                        [data]
                    );

        }


        if (result.error) {

            throw result.error;

        }


        showMessage(
            editingPlayerId
                ? "تم تعديل اللاعب بنجاح."
                : "تمت إضافة اللاعب بنجاح.",
            "success"
        );


        resetPlayerForm();

        await loadAllData();


    } catch (error) {

        console.error(
            "خطأ حفظ اللاعب:",
            error
        );


        showMessage(
            getSupabaseErrorMessage(
                error
            ),
            "error"
        );

    } finally {

        setFormLoading(
            form,
            false
        );

    }

}


/* =========================================================
   تعديل لاعب
========================================================= */

window.editPlayer =
    function (id) {

        const player =
            players.find(
                function (item) {

                    return String(
                        item.id
                    ) ===
                    String(id);

                }
            );


        if (!player) {

            return;

        }


        editingPlayerId =
            player.id;


        const form =
            document.getElementById(
                "playerForm"
            );


        if (!form) {

            return;

        }


        setFormValue(
            form,
            "name",
            player.name
        );

        setFormValue(
            form,
            "team_id",
            player.team_id
        );

        setFormValue(
            form,
            "position",
            player.position
        );

        setFormValue(
            form,
            "number",
            getValue(
                player,
                [
                    "number",
                    "player_number",
                    "shirt_number"
                ]
            )
        );

        setFormValue(
            form,
            "photo_url",
            getPlayerPhoto(
                player
            )
        );

        setFormValue(
            form,
            "birth_date",
            player.birth_date
        );

        setFormValue(
            form,
            "nationality",
            player.nationality
        );

        setFormValue(
            form,
            "height",
            player.height
        );

        setFormValue(
            form,
            "weight",
            player.weight
        );

        setFormValue(
            form,
            "foot",
            player.foot
        );

        setFormValue(
            form,
            "bio",
            player.bio
        );


        setCheckboxValue(
            form,
            "active",
            player.active !== false
        );


        setSubmitText(
            form,
            "💾 حفظ تعديل اللاعب"
        );


        scrollToForm(
            form
        );

    };


/* =========================================================
   حذف لاعب
========================================================= */

window.deletePlayer =
    async function (id) {

        const player =
            players.find(
                function (item) {

                    return String(
                        item.id
                    ) ===
                    String(id);

                }
            );


        const name =
            player
                ? player.name
                : "هذا اللاعب";


        const confirmed =
            window.confirm(
                "هل أنت متأكد من حذف " +
                name +
                "؟"
            );


        if (!confirmed) {

            return;

        }


        try {

            const result =
                await supabaseClient
                    .from("players")
                    .delete()
                    .eq(
                        "id",
                        id
                    );


            if (result.error) {

                throw result.error;

            }


            showMessage(
                "تم حذف اللاعب.",
                "success"
            );


            await loadAllData();


        } catch (error) {

            console.error(
                "خطأ حذف اللاعب:",
                error
            );


            showMessage(
                getSupabaseErrorMessage(
                    error
                ),
                "error"
            );

        }

    };


/* =========================================================
   تحديث قوائم الفرق
========================================================= */

function updateTeamSelects() {

    document
        .querySelectorAll(
            'select[name="team_id"]'
        )
        .forEach(
            function (select) {

                const current =
                    select.value;


                select.innerHTML = `

                    <option value="">
                        اختر الفريق
                    </option>

                    ${
                        teams
                            .map(
                                function (team) {

                                    return `

                                        <option
                                            value="${escapeHTML(
                                                team.id
                                            )}"
                                        >

                                            ${escapeHTML(
                                                team.name
                                            )}

                                        </option>

                                    `;

                                }
                            )
                            .join("")
                    }

                `;


                if (current) {

                    select.value =
                        current;

                }

            }
        );


    /*
     * قوائم المضيف والضيف
     */

    document
        .querySelectorAll(
            'select[name="home_team"], select[name="away_team"]'
        )
        .forEach(
            function (select) {

                const current =
                    select.value;


                select.innerHTML = `

                    <option value="">
                        اختر الفريق
                    </option>

                    ${
                        teams
                            .map(
                                function (team) {

                                    return `

                                        <option
                                            value="${escapeHTML(
                                                team.name
                                            )}"
                                        >

                                            ${escapeHTML(
                                                team.name
                                            )}

                                        </option>

                                    `;

                                }
                            )
                            .join("")
                    }

                `;


                if (current) {

                    select.value =
                        current;

                }

            }
        );

}


/* =========================================================
   إعادة نموذج الفريق
========================================================= */

function resetTeamForm() {

    editingTeamId =
        null;


    const form =
        document.getElementById(
            "teamForm"
        );


    if (!form) {
        return;
    }


    form.reset();


    setSubmitText(
        form,
        "➕ إضافة الفريق"
    );

}


/* =========================================================
   إعادة نموذج المباراة
========================================================= */

function resetMatchForm() {

    editingMatchId =
        null;


    const form =
        document.getElementById(
            "matchForm"
        );


    if (!form) {
        return;
    }


    form.reset();


    setSubmitText(
        form,
        "➕ إضافة المباراة"
    );

}


/* =========================================================
   إعادة نموذج اللاعب
========================================================= */

function resetPlayerForm() {

    editingPlayerId =
        null;


    const form =
        document.getElementById(
            "playerForm"
        );


    if (!form) {
        return;
    }


    form.reset();


    setCheckboxValue(
        form,
        "active",
        true
    );


    setSubmitText(
        form,
        "➕ إضافة اللاعب"
    );

}


/* =========================================================
   حالة الإدارة
========================================================= */

function setAdminStatus(
    state
) {

    const element =
        document.getElementById(
            "connectionStatus"
        );


    if (!element) {
        return;
    }


    if (
        state ===
        "connected"
    ) {

        element.innerHTML = `

            <span class="connection-dot"></span>

            متصل بقاعدة البيانات

        `;

        return;

    }


    if (
        state ===
        "error"
    ) {

        element.innerHTML = `

            <span
                class="connection-dot"
                style="background:#dc2626;"
            ></span>

            حدث خطأ في الاتصال بقاعدة البيانات

        `;

        return;

    }


    element.innerHTML = `

        <span
            class="connection-dot"
            style="background:#f59e0b;"
        ></span>

        جاري الاتصال بقاعدة البيانات...

    `;

}


/* =========================================================
   رسالة
========================================================= */

function showMessage(
    message,
    type
) {

    let box =
        document.getElementById(
            "adminMessage"
        );


    if (!box) {

        box =
            document.createElement(
                "div"
            );


        box.id =
            "adminMessage";


        box.className =
            "admin-message";


        document.body.appendChild(
            box
        );

    }


    box.className =
        "admin-message " +
        (
            type === "error"
                ? "message-error"
                : "message-success"
        );


    box.textContent =
        message;


    box.style.display =
        "block";


    clearTimeout(
        box._timer
    );


    box._timer =
        setTimeout(
            function () {

                box.style.display =
                    "none";

            },
            4000
        );

}


/* =========================================================
   رسالة Supabase
========================================================= */

function getSupabaseErrorMessage(
    error
) {

    if (!error) {

        return "حدث خطأ غير معروف.";

    }


    if (
        error.code ===
        "42501"
    ) {

        return "ليس لديك صلاحية لتنفيذ هذه العملية. تحقق من RLS والسياسات في Supabase.";

    }


    if (
        error.code ===
        "23505"
    ) {

        return "هذه البيانات موجودة مسبقًا.";

    }


    if (
        error.code ===
        "23503"
    ) {

        return "لا يمكن تنفيذ العملية بسبب ارتباط هذه البيانات ببيانات أخرى.";

    }


    return (
        error.message ||
        error.details ||
        "حدث خطأ أثناء تنفيذ العملية."
    );

}


/* =========================================================
   أدوات النماذج
========================================================= */

function getFormValue(
    form,
    name
) {

    const element =
        form.elements[name];


    if (!element) {

        return "";

    }


    return String(
        element.value || ""
    ).trim();

}


function setFormValue(
    form,
    name,
    value
) {

    const element =
        form.elements[name];


    if (!element) {

        return;

    }


    element.value =
        value ??
        "";

}


function getCheckboxValue(
    form,
    name,
    fallback
) {

    const element =
        form.elements[name];


    if (!element) {

        return fallback;

    }


    return Boolean(
        element.checked
    );

}


function setCheckboxValue(
    form,
    name,
    value
) {

    const element =
        form.elements[name];


    if (!element) {

        return;

    }


    element.checked =
        Boolean(
            value
        );

}


/* =========================================================
   زر النموذج
========================================================= */

function setSubmitText(
    form,
    text
) {

    const button =
        form.querySelector(
            'button[type="submit"]'
        );


    if (button) {

        button.textContent =
            text;

    }

}


/* =========================================================
   تحميل النموذج
========================================================= */

function setFormLoading(
    form,
    loading
) {

    const button =
        form.querySelector(
            'button[type="submit"]'
        );


    if (!button) {
        return;
    }


    button.disabled =
        loading;


    if (loading) {

        button.dataset.oldText =
            button.textContent;


        button.textContent =
            "⏳ جاري الحفظ...";

    } else {

        button.textContent =
            button.dataset.oldText ||
            button.textContent;

    }

}


/* =========================================================
   التمرير إلى النموذج
========================================================= */

function scrollToForm(
    form
) {

    form.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================================
   إغلاق النوافذ
========================================================= */

function closeAllModals() {

    document
        .querySelectorAll(
            ".modal"
        )
        .forEach(
            function (modal) {

                modal.classList.add(
                    "hidden"
                );

            }
        );

}


/* =========================================================
   حالة المباراة
========================================================= */

function normalizeStatus(
    status
) {

    const value =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


    if (
        value === "live" ||
        value === "مباشرة"
    ) {

        return "مباشرة";

    }


    if (
        value === "finished" ||
        value === "انتهت"
    ) {

        return "انتهت";

    }


    if (
        value === "upcoming" ||
        value === "قادمة"
    ) {

        return "قادمة";

    }


    return "قادمة";

}


/* =========================================================
   مباراة مباشرة
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
        parts.length === 3
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
   فريق اللاعب
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
        player.team &&
        typeof player.team ===
        "object"
    ) {

        return (
            player.team.name ||
            "غير محدد"
        );

    }


    if (
        player.team &&
        typeof player.team !==
        "object"
    ) {

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
   قيمة متعددة الأسماء
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
   رقم أو NULL
========================================================= */

function toNullableNumber(
    value
) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const number =
        Number(value);


    return Number.isFinite(
        number
    )
        ? number
        : null;

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
   حماية JavaScript
========================================================= */

function escapeJS(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            '\\"'
        )
        .replace(
            /\r/g,
            "\\r"
        )
        .replace(
            /\n/g,
            "\\n"
        );

}


/* =========================================================
   حماية الصور
========================================================= */

function safeImageUrl(
    value
) {

    const url =
        String(
            value || ""
        ).trim();


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
   تحديث تلقائي
========================================================= */

setInterval(
    async function () {

        try {

            await loadAllData();

        } catch (error) {

            console.error(
                "خطأ التحديث التلقائي:",
                error
            );

        }

    },
    10000
);


/* =========================================================
   نهاية admin.js
========================================================= */
