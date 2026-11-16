(function ($) {
    "use strict";

    // Spinner removal
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    // Initiate WOW.js if available
    if (typeof WOW !== 'undefined') {
        new WOW().init();
    }

    // Floating Navbar on Scroll
    $(window).on('scroll', function () {
        var scrollPos = $(this).scrollTop();
        if (scrollPos > 40) {
            $('.header-nav-wrapper').addClass('scrolled');
        } else {
            $('.header-nav-wrapper').removeClass('scrolled');
        }

        // Active navigation link update based on scroll position
        var sections = $('section[id], div[id].about-section, div[id].service, div[id].custom-forms-section, div[id].eligibility-section, div[id].faq-modern, div[id].testimonial');
        sections.each(function () {
            var top = $(this).offset().top - 120;
            var bottom = top + $(this).outerHeight();
            var id = $(this).attr('id');
            if (scrollPos >= top && scrollPos < bottom) {
                $('.navbar-floating-inner .nav-link').removeClass('active');
                $('.navbar-floating-inner .nav-link[href="#' + id + '"]').addClass('active');
            }
        });
        if (scrollPos < 300) {
            $('.navbar-floating-inner .nav-link').removeClass('active');
            $('.navbar-floating-inner .nav-link[href="index.html"]').addClass('active');
        }
    });

    // Hero Header Carousel (with safety guard)
    if ($.fn.owlCarousel && $(".header-carousel").length) {
        $(".header-carousel").owlCarousel({
            items: 1,
            autoplay: true,
            autoplayTimeout: 6500,
            autoplayHoverPause: true,
            smartSpeed: 600,
            dots: true,
            loop: true,
            nav: false
        });
    }

    // Partner Logo Carousel (with safety guard)
    if ($.fn.owlCarousel && $(".logo-carousel").length) {
        $(".logo-carousel").owlCarousel({
            autoplay: true,
            autoplayTimeout: 3000,
            autoplayHoverPause: true,
            smartSpeed: 800,
            margin: 20,
            dots: false,
            loop: true,
            nav: false,
            responsive: {
                0: { items: 1 },
                480: { items: 2 },
                768: { items: 3 },
                992: { items: 4 },
                1200: { items: 4 }
            }
        });
    }

    // Testimonial Carousel (with safety guard)
    if ($.fn.owlCarousel && $(".testimonial-carousel").length) {
        $(".testimonial-carousel").owlCarousel({
            autoplay: true,
            autoplayTimeout: 6500,
            autoplayHoverPause: true,
            smartSpeed: 800,
            center: true,
            dots: true,
            dotsData: true,
            loop: true,
            margin: 30,
            items: 1,
            nav: true,
            navText: [
                '<i class="fas fa-chevron-left"></i>',
                '<i class="fas fa-chevron-right"></i>'
            ]
        });
    }

    // Back to top button
    $(window).on('scroll', function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({scrollTop: 0}, 800);
        return false;
    });

    // =========================================================================
    // INTERACTIVE DME ROI & WORKFLOW CALCULATOR
    // =========================================================================
    function updateRoiCalculations(volume) {
        var vol = parseInt(volume, 10);
        if (isNaN(vol)) vol = 250;

        // Formula calibrated against real DME operational metrics:
        // ~18.7 hours per 60 orders saved on intake, form filling & routing
        var hoursSaved = Math.round(vol * 0.312);
        // Average administrative hourly cost with benefits ~$40/hr
        var annualSavings = Math.round(hoursSaved * 40 * 12);
        
        // Clean claims rate asymptotically scales toward 99.6%
        var cleanClaims = (98.6 + Math.min(1.0, vol / 1000)).toFixed(1);
        
        // Turnaround speed improvement
        var speedPct = 45;
        if (vol >= 500) speedPct = 48;
        if (vol >= 1000) speedPct = 52;

        $('#roi-volume-display').text(vol.toLocaleString() + ' Orders / mo');
        $('#roi-hours-saved').text(hoursSaved);
        $('#roi-annual-savings').text('$' + annualSavings.toLocaleString());
        $('#roi-clean-claims').text(cleanClaims + '%');
        $('#roi-delivery-speed').text(speedPct + '%');
    }

    $('#roi-slider').on('input change', function () {
        var val = $(this).val();
        updateRoiCalculations(val);
        $('.roi-preset-btn').removeClass('active');
        $('.roi-preset-btn[data-val="' + val + '"]').addClass('active');
    });

    $('.roi-preset-btn').on('click', function () {
        var val = $(this).data('val');
        $('.roi-preset-btn').removeClass('active');
        $(this).addClass('active');
        $('#roi-slider').val(val);
        updateRoiCalculations(val);
    });

    // Initial calculation run
    updateRoiCalculations(250);

    // =========================================================================
    // INTERACTIVE SMART FORMS AUTO-FILL SIMULATOR
    // =========================================================================
    var patientProfiles = {
        vance: {
            name: "Eleanor Vance (Female, 68)",
            dob: "11/04/1958 (DOB)",
            doctor: "Dr. Arthur Mitchell, MD (NPI: 1982736450)",
            insurance: "Medicare Part B #48291-A • In-Network",
            diagnosis: "M25.561 Pain in Right Knee (E0143 Walker)"
        },
        sterling: {
            name: "Marcus Sterling (Male, 54)",
            dob: "08/19/1972 (DOB)",
            doctor: "Dr. Rachel Zhang, MD (NPI: 1472859103)",
            insurance: "BlueCross BlueShield #BC-99210 • Pre-Auth OK",
            diagnosis: "G47.33 Obstructive Sleep Apnea (E0601 CPAP)"
        },
        jenkins: {
            name: "Sarah Jenkins (Female, 72)",
            dob: "03/27/1954 (DOB)",
            doctor: "Dr. David Vance, DO (NPI: 1639204851)",
            insurance: "Aetna Senior Care #AET-7714 • Active",
            diagnosis: "G82.20 Paraplegia, Unspecified (K0823 Power Wheelchair)"
        }
    };

    var currentPatientKey = "vance";
    var isFormFilled = false;

    $('.sim-patient-pill').on('click', function () {
        $('.sim-patient-pill').removeClass('active');
        $(this).addClass('active');
        currentPatientKey = $(this).data('patient') || "vance";
        var prof = patientProfiles[currentPatientKey];

        // Update rows data-filled-val
        $('#sim-row-name').data('filled-val', prof.name);
        $('#sim-row-dob').data('filled-val', prof.dob);
        $('#sim-row-doctor').data('filled-val', prof.doctor);
        $('#sim-row-insurance').data('filled-val', prof.insurance);
        $('#sim-row-diagnosis').data('filled-val', prof.diagnosis);

        // If already filled, immediately refresh values with visual pulse
        if (isFormFilled) {
            $('#sim-row-name .form-sim-value').text(prof.name);
            $('#sim-row-dob .form-sim-value').text(prof.dob);
            $('#sim-row-doctor .form-sim-value').text(prof.doctor);
            $('#sim-row-insurance .form-sim-value').text(prof.insurance);
            $('#sim-row-diagnosis .form-sim-value').text(prof.diagnosis);
            $('.form-sim-row').addClass('pulse-glow');
            setTimeout(function () { $('.form-sim-row').removeClass('pulse-glow'); }, 600);
        }
    });

    $('#btn-simulate-form-fill').on('click', function () {
        var $btn = $(this);
        var $rows = $('.form-sim-row');
        var $seal = $('#form-sim-seal');
        var prof = patientProfiles[currentPatientKey] || patientProfiles.vance;

        if (!isFormFilled) {
            $btn.html('<i class="fas fa-spinner fa-spin me-2"></i> Mapping & Auto-Filling...');
            $btn.prop('disabled', true);

            setTimeout(function () {
                $rows.each(function (index) {
                    var $row = $(this);
                    setTimeout(function () {
                        $row.addClass('active-filled');
                        var filledVal = $row.data('filled-val');
                        if (filledVal) {
                            $row.find('.form-sim-value').text(filledVal);
                        }
                    }, index * 100);
                });

                setTimeout(function () {
                    $seal.removeClass('d-none').addClass('animate__animated animate__zoomIn');
                    $btn.html('<i class="fas fa-undo me-2"></i> Reset Demo').prop('disabled', false).removeClass('btn-primary').addClass('btn-outline-primary');
                    isFormFilled = true;
                }, $rows.length * 100 + 150);
            }, 250);
        } else {
            $rows.removeClass('active-filled');
            $rows.each(function () {
                var emptyVal = $(this).data('empty-val') || 'Waiting for auto-fill...';
                $(this).find('.form-sim-value').text(emptyVal);
            });
            $seal.addClass('d-none').removeClass('animate__animated animate__zoomIn');
            $btn.html('<i class="fas fa-magic me-2"></i> Simulate 1-Click Auto-Fill').removeClass('btn-outline-primary').addClass('btn-primary');
            isFormFilled = false;
        }
    });

    // =========================================================================
    // INTERACTIVE MEDICARE & MEDICAID ELIGIBILITY SIMULATOR
    // =========================================================================
    var eligibilityPresets = {
        vance: {
            name: "Eleanor Vance",
            dob: "11/04/1958",
            memberId: "1EG4-TE5-MK72 / MCD-884120",
            stateHcpcs: "TX • E0143 (Walker)",
            overallStatus: "active",
            overallLabel: "Eligible",
            summary: "Dual Eligible — Medicare Primary & Medicaid Secondary",
            medicare: {
                status: "active",
                badge: "Active",
                plan: "Part A & Part B (DMEPOS)",
                deductible: "$0.00 Remaining",
                coins: "20% (Covered by Medicaid)"
            },
            medicaid: {
                status: "active",
                badge: "Active",
                plan: "TX Medicaid QMB (Secondary)",
                copay: "$0.00",
                auth: "Not Required for E0143"
            },
            sameSimilarClear: true,
            sameSimilarText: "<strong>Same-or-Similar Check:</strong> Clear — No active conflicting DMEPOS item on file."
        },
        sterling: {
            name: "Marcus Sterling",
            dob: "08/19/1972",
            memberId: "4KM9-PL2-VN38",
            stateHcpcs: "FL • E0601 (CPAP)",
            overallStatus: "active",
            overallLabel: "Medicare Eligible",
            summary: "Medicare Part B Active — Not Enrolled in Medicaid",
            medicare: {
                status: "active",
                badge: "Active",
                plan: "Medicare Part B (DMEPOS)",
                deductible: "$112.00 Remaining",
                coins: "20% Patient Responsibility"
            },
            medicaid: {
                status: "neutral",
                badge: "Not Enrolled",
                plan: "No State Medicaid Policy Found",
                copay: "N/A",
                auth: "N/A"
            },
            sameSimilarClear: true,
            sameSimilarText: "<strong>Same-or-Similar Check:</strong> Clear — Eligible for E0601 CPAP initial rental."
        },
        hayes: {
            name: "Robert Hayes",
            dob: "02/11/1981",
            memberId: "MCD-CA-9043182",
            stateHcpcs: "CA • K0004 (Wheelchair)",
            overallStatus: "active",
            overallLabel: "Medicaid Eligible",
            summary: "State Medicaid Active — Medicare Coverage Inactive",
            medicare: {
                status: "inactive",
                badge: "Inactive",
                plan: "No Active Medicare Part B",
                deductible: "N/A",
                coins: "N/A"
            },
            medicaid: {
                status: "active",
                badge: "Active",
                plan: "Medi-Cal Managed Care (Primary)",
                copay: "$0.00",
                auth: "Prior Auth Required (TAR)"
            },
            sameSimilarClear: true,
            sameSimilarText: "<strong>Same-or-Similar Check:</strong> Clear — Submit TAR prior authorization to Medi-Cal."
        },
        morales: {
            name: "Linda Morales",
            dob: "06/30/1951",
            memberId: "7QW2-ZX8-RT19",
            stateHcpcs: "NY • E0260 (Hospital Bed)",
            overallStatus: "inactive",
            overallLabel: "Action Needed",
            summary: "Coverage Termed / Same-or-Similar Alert Detected",
            medicare: {
                status: "inactive",
                badge: "Termed",
                plan: "Part B Termed 09/30/2026",
                deductible: "N/A",
                coins: "Verify Advantage Plan"
            },
            medicaid: {
                status: "inactive",
                badge: "Inactive",
                plan: "NY Medicaid Renewal Pending",
                copay: "N/A",
                auth: "Hold Shipment"
            },
            sameSimilarClear: false,
            sameSimilarText: "<strong>Coverage Alert:</strong> Active coverage not confirmed. Verify updated payer card before shipping."
        }
    };

    var activeEligPresetKey = "vance";
    var activeEligProgram = "both";
    var hasRunEligCheck = false;

    function setEligBadge($el, status, text) {
        $el.removeClass('status-active status-inactive status-neutral');
        if (status === 'active') {
            $el.addClass('status-active').html('<i class="fas fa-check-circle me-1"></i> ' + text);
        } else if (status === 'inactive') {
            $el.addClass('status-inactive').html('<i class="fas fa-times-circle me-1"></i> ' + text);
        } else {
            $el.addClass('status-neutral').html('<i class="fas fa-minus-circle me-1"></i> ' + text);
        }
    }

    function applyEligProgramFilter() {
        if (activeEligProgram === 'medicare') {
            $('#elig-card-medicare').removeClass('d-none col-sm-6').addClass('col-12');
            $('#elig-card-medicaid').addClass('d-none');
        } else if (activeEligProgram === 'medicaid') {
            $('#elig-card-medicaid').removeClass('d-none col-sm-6').addClass('col-12');
            $('#elig-card-medicare').addClass('d-none');
        } else {
            $('#elig-card-medicare').removeClass('d-none col-12').addClass('col-sm-6');
            $('#elig-card-medicaid').removeClass('d-none col-12').addClass('col-sm-6');
        }
    }

    function renderEligibilityResults() {
        var nameInput = $.trim($('#elig-patient-name').val());
        var dobInput = $.trim($('#elig-patient-dob').val());
        var idInput = $.trim($('#elig-member-id').val());
        var stateHcpcsInput = $.trim($('#elig-state-hcpcs').val()) || 'US • DMEPOS';

        var preset = eligibilityPresets[activeEligPresetKey];
        var isCustomPatient = !preset || nameInput.toLowerCase() !== preset.name.toLowerCase();

        var data;
        if (isCustomPatient) {
            data = {
                overallStatus: "active",
                overallLabel: "Eligible",
                summary: activeEligProgram === 'medicare'
                    ? "Medicare Part B Active (Simulated Check)"
                    : (activeEligProgram === 'medicaid'
                        ? "State Medicaid Active (Simulated Check)"
                        : "Active Medicare & Medicaid Coverage (Simulated)"),
                medicare: {
                    status: activeEligProgram === 'medicaid' ? "neutral" : "active",
                    badge: activeEligProgram === 'medicaid' ? "Skipped" : "Active",
                    plan: "Part A & Part B (DMEPOS)",
                    deductible: "$0.00 Remaining",
                    coins: "20% Coinsurance"
                },
                medicaid: {
                    status: activeEligProgram === 'medicare' ? "neutral" : "active",
                    badge: activeEligProgram === 'medicare' ? "Skipped" : "Active",
                    plan: "State Medicaid Plan",
                    copay: "$0.00",
                    auth: "Verify for " + stateHcpcsInput
                },
                sameSimilarClear: true,
                sameSimilarText: "<strong>Same-or-Similar Check:</strong> Clear for " + $('<div>').text(stateHcpcsInput).html() + " (ID: " + $('<div>').text(idInput).html() + ")."
            };
        } else {
            data = preset;
        }

        $('#elig-banner-patient').text(nameInput + ' • DOB ' + dobInput + ' • ID ' + idInput);
        $('#elig-banner-summary').text(data.summary);
        setEligBadge($('#elig-overall-badge'), data.overallStatus, data.overallLabel);

        var $banner = $('#elig-result-banner');
        $banner.removeClass('banner-active banner-inactive').addClass(data.overallStatus === 'inactive' ? 'banner-inactive' : 'banner-active');

        setEligBadge($('#elig-medicare-badge'), data.medicare.status, data.medicare.badge);
        $('#elig-medicare-plan').text(data.medicare.plan);
        $('#elig-medicare-deductible').text(data.medicare.deductible);
        $('#elig-medicare-coins').text(data.medicare.coins);

        setEligBadge($('#elig-medicaid-badge'), data.medicaid.status, data.medicaid.badge);
        $('#elig-medicaid-plan').text(data.medicaid.plan);
        $('#elig-medicaid-copay').text(data.medicaid.copay);
        $('#elig-medicaid-auth').text(data.medicaid.auth);

        var $bar = $('#elig-same-similar-bar');
        $bar.removeClass('alert-clear alert-warn').addClass(data.sameSimilarClear ? 'alert-clear' : 'alert-warn');
        $bar.find('i').attr('class', data.sameSimilarClear ? 'fas fa-check-double text-success me-2' : 'fas fa-exclamation-triangle text-danger me-2');
        $('#elig-same-similar-text').html(data.sameSimilarText);

        applyEligProgramFilter();
        $('#eligibility-result-panel').removeClass('d-none');
        hasRunEligCheck = true;
    }

    $('.elig-patient-pill').on('click', function () {
        $('.elig-patient-pill').removeClass('active');
        $(this).addClass('active');
        activeEligPresetKey = $(this).data('elig-patient') || 'vance';
        var preset = eligibilityPresets[activeEligPresetKey];
        if (preset) {
            $('#elig-patient-name').val(preset.name);
            $('#elig-patient-dob').val(preset.dob);
            $('#elig-member-id').val(preset.memberId);
            $('#elig-state-hcpcs').val(preset.stateHcpcs);
            $('#elig-form-error').addClass('d-none');
            if (hasRunEligCheck) {
                renderEligibilityResults();
            }
        }
    });

    $('.elig-program-tab').on('click', function () {
        $('.elig-program-tab').removeClass('active');
        $(this).addClass('active');
        activeEligProgram = $(this).data('program') || 'both';
        if (hasRunEligCheck) {
            renderEligibilityResults();
        }
    });

    $('#eligibility-check-form').on('submit', function (e) {
        e.preventDefault();
        var nameInput = $.trim($('#elig-patient-name').val());
        var dobInput = $.trim($('#elig-patient-dob').val());
        var idInput = $.trim($('#elig-member-id').val());

        if (!nameInput || !dobInput || !idInput) {
            $('#elig-form-error').removeClass('d-none');
            return;
        }
        $('#elig-form-error').addClass('d-none');

        var $btn = $('#btn-check-eligibility');
        $btn.html('<i class="fas fa-spinner fa-spin me-2"></i> Querying CMS &amp; Medicaid...').prop('disabled', true);

        setTimeout(function () {
            renderEligibilityResults();
            $btn.html('<i class="fas fa-sync-alt me-2"></i> Re-Check Eligibility').prop('disabled', false);
            $('#elig-last-checked').html('<i class="fas fa-check-circle text-success me-1"></i> Verified just now');
        }, 450);
    });

    // =========================================================================
    // DARK MODE / LIGHT MODE THEME TOGGLE
    // =========================================================================
    function applyTheme(theme) {
        if (theme === 'dark') {
            $('html').attr('data-theme', 'dark');
            $('.theme-icon-moon').addClass('d-none');
            $('.theme-icon-sun').removeClass('d-none');
            localStorage.setItem('dm3_theme', 'dark');
        } else {
            $('html').attr('data-theme', 'light');
            $('.theme-icon-sun').addClass('d-none');
            $('.theme-icon-moon').removeClass('d-none');
            localStorage.setItem('dm3_theme', 'light');
        }
    }

    var savedTheme = localStorage.getItem('dm3_theme');
    if (!savedTheme) {
        savedTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    applyTheme(savedTheme);

    $(document).on('click', '#theme-toggle', function (e) {
        e.preventDefault();
        var nextTheme = $('html').attr('data-theme') === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
    });

})(jQuery);
