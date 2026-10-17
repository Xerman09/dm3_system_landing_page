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
        var sections = $('section[id], div[id].about-section, div[id].service, div[id].custom-forms-section, div[id].faq-modern, div[id].testimonial');
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

    // Hero Header Carousel
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

    // Partner Logo Carousel
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

    // Testimonial Carousel (Single clean initialization)
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

})(jQuery);
