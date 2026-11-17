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

    // Testimonial Carousel (with safety guard & interactive controls)
    var $testimonialCarousel = $(".testimonial-carousel");
    if ($.fn.owlCarousel && $testimonialCarousel.length) {
        var testimonialAutoPlaying = true;
        var $slideCounter = $('#testimonial-slide-counter');
        var $autoplayToggle = $('#testimonial-autoplay-toggle');

        function updateTestimonialCounter(event) {
            if (!$slideCounter.length || !event || !event.item) return;
            var total = event.item.count || 4;
            var current = ((event.item.index - event.relatedTarget._clones.length / 2) % total + total) % total + 1;
            if (isNaN(current) || current < 1) current = 1;
            $slideCounter.html('<i class="fas fa-layer-group text-primary me-1"></i> Story <strong>' + current + '</strong> of ' + total);
        }

        $testimonialCarousel.on('initialized.owl.carousel changed.owl.carousel', updateTestimonialCounter);

        $testimonialCarousel.owlCarousel({
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

        $autoplayToggle.on('click', function () {
            testimonialAutoPlaying = !testimonialAutoPlaying;
            if (testimonialAutoPlaying) {
                $testimonialCarousel.trigger('play.owl.autoplay', [6500]);
                $(this).removeClass('paused').attr('aria-pressed', 'false')
                    .html('<i class="fas fa-pause me-1"></i> Pause Auto-Rotate');
            } else {
                $testimonialCarousel.trigger('stop.owl.autoplay');
                $(this).addClass('paused').attr('aria-pressed', 'true')
                    .html('<i class="fas fa-play me-1"></i> Resume Auto-Rotate');
            }
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
    // INTERACTIVE DME ROI & WORKFLOW CALCULATOR (with smooth number tweening)
    // =========================================================================
    var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var roiTweenFrames = {};

    function animateMetricValue($el, targetVal, formatter, key) {
        if (prefersReducedMotion || !$el.length) {
            $el.text(formatter(targetVal));
            return;
        }
        if (roiTweenFrames[key]) {
            cancelAnimationFrame(roiTweenFrames[key]);
        }
        var currentVal = parseFloat($el.data('current-val'));
        if (isNaN(currentVal)) {
            $el.data('current-val', targetVal);
            $el.text(formatter(targetVal));
            return;
        }
        var startVal = currentVal;
        var startTime = performance.now();
        var duration = 380;

        function step(now) {
            var progress = Math.min(1, (now - startTime) / duration);
            var eased = 1 - Math.pow(1 - progress, 3);
            var val = startVal + (targetVal - startVal) * eased;
            $el.text(formatter(val));
            $el.data('current-val', val);
            if (progress < 1) {
                roiTweenFrames[key] = requestAnimationFrame(step);
            } else {
                $el.data('current-val', targetVal);
                $el.text(formatter(targetVal));
            }
        }
        roiTweenFrames[key] = requestAnimationFrame(step);
    }

    function updateRoiCalculations(volume) {
        var vol = parseInt(volume, 10);
        if (isNaN(vol)) vol = 250;

        // Formula calibrated against real DME operational metrics:
        // ~18.7 hours per 60 orders saved on intake, form filling & routing
        var hoursSaved = Math.round(vol * 0.312);
        // Average administrative hourly cost with benefits ~$40/hr
        var annualSavings = Math.round(hoursSaved * 40 * 12);
        
        // Clean claims rate asymptotically scales toward 99.6%
        var cleanClaims = parseFloat((98.6 + Math.min(1.0, vol / 1000)).toFixed(1));
        
        // Turnaround speed improvement
        var speedPct = 45;
        if (vol >= 500) speedPct = 48;
        if (vol >= 1000) speedPct = 52;

        $('#roi-volume-display').text(vol.toLocaleString() + ' Orders / mo');
        animateMetricValue($('#roi-hours-saved'), hoursSaved, function (v) { return Math.round(v).toLocaleString(); }, 'hours');
        animateMetricValue($('#roi-annual-savings'), annualSavings, function (v) { return '$' + Math.round(v).toLocaleString(); }, 'savings');
        animateMetricValue($('#roi-clean-claims'), cleanClaims, function (v) { return v.toFixed(1) + '%'; }, 'claims');
        animateMetricValue($('#roi-delivery-speed'), speedPct, function (v) { return Math.round(v) + '%'; }, 'speed');
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
        var $loader = $('#elig-scan-loader');
        var $fill = $('#elig-scan-fill');
        var $stepText = $('#elig-scan-step-text');
        var $pct = $('#elig-scan-pct');
        var $resultPanel = $('#eligibility-result-panel');

        $btn.html('<i class="fas fa-spinner fa-spin me-2"></i> Querying CMS &amp; Medicaid...').prop('disabled', true);
        $resultPanel.addClass('d-none');
        $loader.removeClass('d-none');
        $fill.css('width', '15%');
        $pct.text('15%');
        $stepText.html('<i class="fas fa-satellite-dish fa-spin me-2 text-primary"></i>Connecting to CMS &amp; State Medicaid EDI 270...');

        var delay = prefersReducedMotion ? 50 : 280;

        setTimeout(function () {
            $fill.css('width', '58%');
            $pct.text('58%');
            $stepText.html('<i class="fas fa-shield-alt fa-spin me-2 text-primary"></i>Verifying Medicare Part A/B &amp; QMB Dual-Eligibility...');
        }, delay);

        setTimeout(function () {
            $fill.css('width', '92%');
            $pct.text('92%');
            $stepText.html('<i class="fas fa-clipboard-check me-2 text-primary"></i>Screening Same-or-Similar DMEPOS records...');
        }, delay * 2);

        setTimeout(function () {
            $fill.css('width', '100%');
            $pct.text('100%');
            $loader.addClass('d-none');
            renderEligibilityResults();

            // Staggered reveal animation for banner, cards, and screening bar
            var $targets = $('#elig-result-banner, #elig-card-medicare, #elig-card-medicaid, #elig-same-similar-bar');
            $targets.removeClass('elig-reveal-in').css('animation-delay', '');
            if (!prefersReducedMotion) {
                $targets.each(function (idx) {
                    var $el = $(this);
                    void this.offsetWidth;
                    $el.css('animation-delay', (idx * 75) + 'ms').addClass('elig-reveal-in');
                });
            }

            $btn.html('<i class="fas fa-sync-alt me-2"></i> Re-Check Eligibility').prop('disabled', false);
            $('#elig-last-checked').html('<i class="fas fa-check-circle text-success me-1"></i> Verified just now');
        }, delay * 3);
    });

    // =========================================================================
    // TOP SCROLL PROGRESS BAR & CARD SPOTLIGHT / MICRO-TILT ANIMATION
    // =========================================================================
    var $scrollBar = $('#scroll-progress-bar');
    if ($scrollBar.length) {
        $(window).on('scroll resize', function () {
            var docHeight = $(document).height() - $(window).height();
            var pct = docHeight > 0 ? Math.min(100, Math.max(0, ($(window).scrollTop() / docHeight) * 100)) : 0;
            $scrollBar.css('width', pct.toFixed(1) + '%');
        });
    }

    if (!prefersReducedMotion && window.matchMedia && window.matchMedia('(pointer: fine)').matches) {
        $('.service-item, .step-card').on('mousemove', function (e) {
            var rect = this.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var rotateY = ((x / rect.width) - 0.5) * 5;
            var rotateX = ((0.5 - (y / rect.height)) * 5);
            this.style.setProperty('--mouse-x', x + 'px');
            this.style.setProperty('--mouse-y', y + 'px');
            this.style.transform = 'perspective(900px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) translateY(-4px)';
            $(this).addClass('is-hovered');
        }).on('mouseleave', function () {
            this.style.transform = '';
            $(this).removeClass('is-hovered');
        });
    }

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

    // =========================================================================
    // INTERACTIVE FAQ SEARCH, CATEGORY FILTER & EXPAND/COLLAPSE ALL
    // =========================================================================
    var $faqAccordion = $('#accordionExample');
    if ($faqAccordion.length) {
        var activeFaqCategory = 'all';
        var faqAllExpanded = false;
        var $faqItems = $faqAccordion.find('.accordion-item');
        var totalFaqCount = $faqItems.length;
        var $faqSearchInput = $('#faq-search-input');
        var $faqSearchClear = $('#faq-search-clear');
        var $faqResultsMeta = $('#faq-results-meta');
        var $faqEmptyState = $('#faq-empty-state');
        var $faqToggleAllBtn = $('#faq-toggle-all');

        function updateFaqVisibility() {
            var query = $.trim($faqSearchInput.val()).toLowerCase();
            var visibleCount = 0;

            $faqSearchClear.toggleClass('d-none', query.length === 0);

            $faqItems.each(function () {
                var $item = $(this);
                var cat = $item.attr('data-faq-category') || '';
                var text = $item.text().toLowerCase();
                var matchesCat = activeFaqCategory === 'all' || cat === activeFaqCategory;
                var matchesQuery = !query || text.indexOf(query) !== -1;

                if (matchesCat && matchesQuery) {
                    $item.removeClass('d-none');
                    visibleCount++;
                } else {
                    $item.addClass('d-none');
                }
            });

            $faqResultsMeta.html('Showing <strong>' + visibleCount + '</strong> of ' + totalFaqCount + ' questions');
            $faqEmptyState.toggleClass('d-none', visibleCount > 0);
            $faqToggleAllBtn.prop('disabled', visibleCount === 0);
        }

        $(document).on('click', '.faq-filter-pill', function () {
            $('.faq-filter-pill').removeClass('active');
            $(this).addClass('active');
            activeFaqCategory = $(this).attr('data-faq-category') || 'all';
            updateFaqVisibility();
        });

        $faqSearchInput.on('input', function () {
            updateFaqVisibility();
        });

        $faqSearchClear.on('click', function () {
            $faqSearchInput.val('').trigger('focus');
            updateFaqVisibility();
        });

        $('#faq-reset-filters').on('click', function () {
            $faqSearchInput.val('');
            activeFaqCategory = 'all';
            $('.faq-filter-pill').removeClass('active').filter('[data-faq-category="all"]').addClass('active');
            updateFaqVisibility();
        });

        $faqToggleAllBtn.on('click', function () {
            faqAllExpanded = !faqAllExpanded;
            var $visibleItems = $faqItems.not('.d-none');

            $visibleItems.each(function () {
                var $collapse = $(this).find('.accordion-collapse');
                var $btn = $(this).find('.accordion-button');
                if (faqAllExpanded) {
                    $collapse.removeAttr('data-bs-parent').addClass('show');
                    $btn.removeClass('collapsed').attr('aria-expanded', 'true');
                } else {
                    $collapse.attr('data-bs-parent', '#accordionExample').removeClass('show');
                    $btn.addClass('collapsed').attr('aria-expanded', 'false');
                }
            });

            if (faqAllExpanded) {
                $faqToggleAllBtn.html('<i class="fas fa-compress-alt me-1"></i> Collapse All');
            } else {
                $faqToggleAllBtn.html('<i class="fas fa-expand-alt me-1"></i> Expand All');
            }
        });

        // Helper: Open, highlight, and scroll to a specific FAQ collapse ID
        function openAndFocusFaq(targetSelector, shouldScroll) {
            var $targetCollapse = $(targetSelector);
            if (!$targetCollapse.length) return;

            // Reset filters if the target item is hidden
            var $targetItem = $targetCollapse.closest('.accordion-item');
            if ($targetItem.hasClass('d-none')) {
                $faqSearchInput.val('');
                activeFaqCategory = 'all';
                $('.faq-filter-pill').removeClass('active').filter('[data-faq-category="all"]').addClass('active');
                updateFaqVisibility();
            }

            if (typeof bootstrap !== 'undefined' && bootstrap.Collapse) {
                bootstrap.Collapse.getOrCreateInstance($targetCollapse[0], { toggle: false }).show();
            } else {
                $targetCollapse.addClass('show');
                $targetItem.find('.accordion-button').removeClass('collapsed').attr('aria-expanded', 'true');
            }

            $targetItem.removeClass('faq-item-pulse');
            void $targetItem[0].offsetWidth;
            $targetItem.addClass('faq-item-pulse');

            if (shouldScroll) {
                $('html, body').animate({ scrollTop: Math.max(0, $targetItem.offset().top - 110) }, 450);
            }
        }

        // Quick-topic chips
        $(document).on('click', '.faq-topic-chip', function () {
            var target = $(this).attr('data-faq-target');
            if (target) {
                openAndFocusFaq(target, true);
            }
        });

        // Inject interactive "Was this helpful?" + "Copy Link" footer into each FAQ body
        var savedFaqVotes = {};
        try {
            savedFaqVotes = JSON.parse(localStorage.getItem('dm3_faq_votes') || '{}');
        } catch (e) {
            savedFaqVotes = {};
        }

        $faqItems.each(function () {
            var $collapse = $(this).find('.accordion-collapse');
            var collapseId = $collapse.attr('id');
            var $body = $(this).find('.accordion-body');
            if (!collapseId || !$body.length) return;

            var existingVote = savedFaqVotes[collapseId] || '';
            var footerHtml =
                '<div class="faq-answer-footer" data-faq-id="' + collapseId + '">' +
                    '<div class="faq-helpful-group">' +
                        '<span>Was this helpful?</span>' +
                        '<button type="button" class="faq-helpful-btn' + (existingVote === 'yes' ? ' voted' : '') + '" data-vote="yes" aria-label="Mark answer as helpful">' +
                            '<i class="fas fa-thumbs-up me-1"></i> Yes' +
                        '</button>' +
                        '<button type="button" class="faq-helpful-btn' + (existingVote === 'no' ? ' voted' : '') + '" data-vote="no" aria-label="Mark answer as not helpful">' +
                            '<i class="fas fa-thumbs-down me-1"></i> No' +
                        '</button>' +
                        '<span class="faq-vote-thanks text-primary fw-semibold' + (existingVote ? '' : ' d-none') + '">Thanks for your feedback!</span>' +
                    '</div>' +
                    '<button type="button" class="faq-copy-link-btn" data-copy-target="#' + collapseId + '" aria-label="Copy direct link to question">' +
                        '<i class="fas fa-link me-1"></i> Copy Link' +
                    '</button>' +
                '</div>';

            $body.append(footerHtml);
        });

        $(document).on('click', '.faq-helpful-btn', function () {
            var $btn = $(this);
            var $footer = $btn.closest('.faq-answer-footer');
            var faqId = $footer.attr('data-faq-id');
            var vote = $btn.attr('data-vote');

            $footer.find('.faq-helpful-btn').removeClass('voted');
            $btn.addClass('voted');
            $footer.find('.faq-vote-thanks').removeClass('d-none');

            if (faqId) {
                savedFaqVotes[faqId] = vote;
                try {
                    localStorage.setItem('dm3_faq_votes', JSON.stringify(savedFaqVotes));
                } catch (e) {}
            }
        });

        $(document).on('click', '.faq-copy-link-btn', function () {
            var $btn = $(this);
            var hash = $btn.attr('data-copy-target') || '#faq';
            var fullUrl = window.location.origin + window.location.pathname + hash;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(fullUrl).catch(function () {});
            } else {
                var $temp = $('<input>').val(fullUrl).appendTo('body').select();
                try { document.execCommand('copy'); } catch (e) {}
                $temp.remove();
            }

            if (window.history && window.history.replaceState) {
                window.history.replaceState(null, '', hash);
            }

            $btn.html('<i class="fas fa-check text-success me-1"></i> Copied!');
            setTimeout(function () {
                $btn.html('<i class="fas fa-link me-1"></i> Copy Link');
            }, 1800);
        });

        // Deep-link auto-open if URL hash points to a specific FAQ item
        if (window.location.hash && /^#collapse(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)$/.test(window.location.hash)) {
            setTimeout(function () {
                openAndFocusFaq(window.location.hash, true);
            }, 250);
        }

        // Interactive DME Assistant inside FAQ Help Card
        var assistPresets = {
            trial: {
                reply: '<strong>Free Trial &amp; Pricing:</strong> Start a free trial with no credit card required. Plans include 24/7 support, guided onboarding, and zero hidden maintenance fees.',
                faqTarget: '#collapseTen'
            },
            eligibility: {
                reply: '<strong>Real-Time EDI 270/271:</strong> DM3 verifies Medicare Part A/B (DMEPOS), Medicare Advantage, and all 50 State Medicaid plans—flagging dual-eligible (QMB/SLMB) &amp; same-or-similar conflicts before shipping.',
                faqTarget: '#collapseFour'
            },
            migration: {
                reply: '<strong>14-Day Guided Migration:</strong> Our team imports your existing patient charts, physician NPI lists, HCPCS catalog, and custom PDF forms with zero operational downtime.',
                faqTarget: '#collapseSix'
            }
        };

        var $assistReply = $('#faq-assist-reply');
        var $assistReplyText = $('#faq-assist-reply-text');
        var $assistInput = $('#faq-assist-input');

        function showAssistReply(html, faqTarget) {
            $assistReplyText.html(html);
            $assistReply.removeClass('d-none');
            if (faqTarget) {
                openAndFocusFaq(faqTarget, false);
            }
        }

        $(document).on('click', '.faq-assist-chip', function () {
            $('.faq-assist-chip').removeClass('active');
            $(this).addClass('active');
            var topic = $(this).attr('data-assist-topic');
            var preset = assistPresets[topic];
            if (preset) {
                showAssistReply(preset.reply, preset.faqTarget);
            }
        });

        $('#faq-assistant-form').on('submit', function (e) {
            e.preventDefault();
            var q = $.trim($assistInput.val()).toLowerCase();
            if (!q) return;

            $('.faq-assist-chip').removeClass('active');

            if (q.indexOf('hipaa') !== -1 || q.indexOf('baa') !== -1 || q.indexOf('secur') !== -1 || q.indexOf('encrypt') !== -1) {
                showAssistReply('<strong>HIPAA &amp; Security:</strong> DM3 uses 256-bit SSL in transit, AES-256 at rest, role-based access, and includes a signed BAA.', '#collapseTwo');
            } else if (q.indexOf('pdf') !== -1 || q.indexOf('form') !== -1 || q.indexOf('cmn') !== -1 || q.indexOf('dwo') !== -1) {
                showAssistReply('<strong>Smart PDF Forms:</strong> Upload any PDF, drag-and-drop patient/doctor fields once, and auto-fill in 1 click from any patient chart.', '#collapseThree');
            } else if (q.indexOf('medicare') !== -1 || q.indexOf('medicaid') !== -1 || q.indexOf('elig') !== -1 || q.indexOf('270') !== -1) {
                showAssistReply(assistPresets.eligibility.reply, assistPresets.eligibility.faqTarget);
            } else if (q.indexOf('gps') !== -1 || q.indexOf('driver') !== -1 || q.indexOf('deliver') !== -1 || q.indexOf('sign') !== -1) {
                showAssistReply('<strong>Live Delivery &amp; POD:</strong> Drivers use mobile devices for turn-by-turn routing, arrival timestamps, and digital patient signatures.', '#collapseFive');
            } else if (q.indexOf('migrat') !== -1 || q.indexOf('onboard') !== -1 || q.indexOf('setup') !== -1 || q.indexOf('import') !== -1) {
                showAssistReply(assistPresets.migration.reply, assistPresets.migration.faqTarget);
            } else if (q.indexOf('audit') !== -1 || q.indexOf('swo') !== -1 || q.indexOf('claim') !== -1 || q.indexOf('denial') !== -1) {
                showAssistReply('<strong>Audit &amp; Clean Claims:</strong> Every order bundles prescriptions, NPI validation, SWO checklists, and signed PODs for a 99.2%+ clean claim rate.', '#collapseSeven');
            } else if (q.indexOf('trial') !== -1 || q.indexOf('price') !== -1 || q.indexOf('cost') !== -1 || q.indexOf('free') !== -1) {
                showAssistReply(assistPresets.trial.reply, assistPresets.trial.faqTarget);
            } else {
                // Fallback: filter main FAQ list by the user's query
                $faqSearchInput.val(q);
                activeFaqCategory = 'all';
                $('.faq-filter-pill').removeClass('active').filter('[data-faq-category="all"]').addClass('active');
                updateFaqVisibility();
                showAssistReply('We filtered the FAQ list for <strong>"' + $('<div>').text(q).html() + '"</strong>. Need a tailored walkthrough? Click <strong>Schedule Consultation</strong> below.', null);
            }
        });

        $('#faq-assist-close').on('click', function () {
            $assistReply.addClass('d-none');
            $('.faq-assist-chip').removeClass('active');
        });
    }

})(jQuery);
