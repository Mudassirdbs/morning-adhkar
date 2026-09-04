<?php
/*
Plugin Name: Morning Adhkar - أذكار الصباح
Plugin URI: https://github.com/Mudassirdbs/morning-adhkar
Description: Embeds the Morning Adhkar (أذكار الصباح) interactive application with audio recitations and counter via shortcode [morning_adhkar].
Version: 1.0.0
Author: Mudassir Asghar
Author URI: https://mudassirasghar.com/
License: GPL-2.0+
Text Domain: morning-adhkar
*/

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Shortcode to embed the Morning Adhkar application.
 *
 * Usage:
 * [morning_adhkar]
 * [morning_adhkar max_width="100%" initial_height="900px"]
 * [morning_azkar]
 */
function morning_adhkar_shortcode($atts = [])
{
    $atts = shortcode_atts(
        [
            'max_width'      => '1200px',
            'initial_height' => '900px',
            'scrolling'      => 'no',
            'class'          => '',
        ],
        $atts,
        'morning_adhkar'
    );

    $iframe_url = 'https://morning-adhkar.vercel.app/';
    $iframe_id  = 'morning-adhkar-iframe-' . uniqid();
    $class_attr = !empty($atts['class']) ? ' ' . esc_attr($atts['class']) : '';

    ob_start();
    ?>
    <div class="morning-adhkar-wrapper<?php echo $class_attr; ?>" style="width: 100%; max-width: <?php echo esc_attr($atts['max_width']); ?>; margin: 0 auto;">
        <iframe
            id="<?php echo esc_attr($iframe_id); ?>"
            src="<?php echo esc_url($iframe_url); ?>"
            style="width: 100%; border: none; display: block; overflow: hidden; transition: height 0.3s ease-in-out;"
            scrolling="<?php echo esc_attr($atts['scrolling']); ?>"
            allow="autoplay; clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox allow-forms"
            title="أذكار الصباح - Morning Adhkar"
            loading="lazy">
        </iframe>
    </div>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const iframe = document.getElementById('<?php echo esc_js($iframe_id); ?>');
            if (!iframe) return;

            const ALLOWED_ORIGIN = 'https://morning-adhkar.vercel.app';

            // Initial fallback height; replaced dynamically by postMessage from the app
            iframe.style.height = '<?php echo esc_js($atts['initial_height']); ?>';

            // Listen for height updates from the Morning Adhkar app and adjust iframe height
            window.addEventListener('message', function(event) {
                if (event.origin !== ALLOWED_ORIGIN) return;
                if (!event.data || typeof event.data.height !== 'number') return;
                const newHeight = Math.ceil(event.data.height) + 8; // safety buffer
                iframe.style.height = newHeight + 'px';
            }, false);
        });
    </script>
    <?php
    return ob_get_clean();
}

// Register shortcode and common aliases
add_shortcode('morning_adhkar', 'morning_adhkar_shortcode');
add_shortcode('morning_azkar', 'morning_adhkar_shortcode');
add_shortcode('azkar_morning', 'morning_adhkar_shortcode');
