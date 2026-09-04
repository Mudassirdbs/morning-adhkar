<?php
/*
Plugin Name: Morning Adhkar & Daily Duas - أذكار الصباح والأدعية اليومية
Plugin URI: https://github.com/Mudassirdbs/morning-adhkar
Description: Embeds Morning Adhkar (أذكار الصباح) and Daily Duas (أدعية وأذكار يومية) interactive applications with audio recitations and counter via shortcodes [morning_adhkar] and [daily_duas].
Version: 1.1.0
Author: Mudassir Asghar
Author URI: https://mudassirasghar.com/
License: GPL-2.0+
Text Domain: morning-adhkar
*/

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Core function to render the Adhkar / Duas application iframe.
 *
 * @param array  $atts         Shortcode attributes.
 * @param string $default_slug Default page slug (empty for home/morning adhkar, 'daily-duas' for daily supplications).
 * @return string
 */
function morning_adhkar_render_iframe($atts = [], $default_slug = '')
{
    $atts = shortcode_atts(
        [
            'slug'           => $default_slug,
            'page'           => '',
            'type'           => '',
            'max_width'      => '1200px',
            'initial_height' => '900px',
            'scrolling'      => 'no',
            'class'          => '',
        ],
        $atts
    );

    // Determine target slug from parameters
    $slug = !empty($atts['page']) ? $atts['page'] : (!empty($atts['slug']) ? $atts['slug'] : $default_slug);
    if (empty($slug) && !empty($atts['type'])) {
        $slug = ($atts['type'] === 'daily' || $atts['type'] === 'duas') ? 'daily-duas' : '';
    }

    $slug = trim($slug, '/');
    $base_url = 'https://morning-adhkar.vercel.app';
    $iframe_url = !empty($slug) ? $base_url . '/' . $slug : $base_url . '/';
    $iframe_id  = 'adhkar-iframe-' . uniqid();
    $class_attr = !empty($atts['class']) ? ' ' . esc_attr($atts['class']) : '';
    $title_attr = ($slug === 'daily-duas' || strpos($slug, 'daily') !== false)
        ? 'أدعية وأذكار يومية - Daily Islamic Duas'
        : 'أذكار الصباح - Morning Adhkar';

    ob_start();
    ?>
    <div class="morning-adhkar-wrapper<?php echo $class_attr; ?>" style="width: 100%; max-width: <?php echo esc_attr($atts['max_width']); ?>; margin: 0 auto;">
        <iframe
            id="<?php echo esc_attr($iframe_id); ?>"
            src="<?php echo esc_url($iframe_url); ?>"
            style="width: 100%; border: none; display: block; overflow: hidden; background: transparent; transition: height 0.3s ease-in-out;"
            scrolling="<?php echo esc_attr($atts['scrolling']); ?>"
            allow="autoplay; clipboard-write"
            allowtransparency="true"
            sandbox="allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox allow-forms"
            title="<?php echo esc_attr($title_attr); ?>"
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

            let currentHeight = 0;

            // Listen for height updates from the Adhkar app and adjust iframe height
            window.addEventListener('message', function(event) {
                if (event.origin !== ALLOWED_ORIGIN) return;
                if (!event.data || typeof event.data.height !== 'number') return;
                if (event.data.type && event.data.type !== 'adhkar-height') return;

                const newHeight = Math.ceil(event.data.height);

                // Prevent infinite resize loop: only update if height changed by at least 10px
                if (Math.abs(newHeight - currentHeight) < 10) return;

                currentHeight = newHeight;
                iframe.style.height = newHeight + 'px';
            }, false);
        });
    </script>
    <?php
    return ob_get_clean();
}

/**
 * Shortcode for Morning Adhkar.
 *
 * Usage:
 * [morning_adhkar]
 * [morning_adhkar max_width="100%" initial_height="900px"]
 * [morning_adhkar page="daily-duas"]
 */
function morning_adhkar_shortcode($atts = [])
{
    return morning_adhkar_render_iframe($atts, '');
}

/**
 * Shortcode for Daily Duas (أدعية وأذكار يومية).
 *
 * Usage:
 * [daily_duas]
 * [daily_duas max_width="100%" initial_height="900px"]
 * [daily_adhkar]
 * [daily_azkar]
 */
function daily_duas_shortcode($atts = [])
{
    return morning_adhkar_render_iframe($atts, 'daily-duas');
}

// Register Morning Adhkar shortcodes
add_shortcode('morning_adhkar', 'morning_adhkar_shortcode');
add_shortcode('morning_azkar', 'morning_adhkar_shortcode');
add_shortcode('azkar_morning', 'morning_adhkar_shortcode');

// Register Daily Duas shortcodes and common aliases
add_shortcode('daily_duas', 'daily_duas_shortcode');
add_shortcode('daily_adhkar', 'daily_duas_shortcode');
add_shortcode('daily_azkar', 'daily_duas_shortcode');
add_shortcode('azkar_daily', 'daily_duas_shortcode');
add_shortcode('duas_daily', 'daily_duas_shortcode');
