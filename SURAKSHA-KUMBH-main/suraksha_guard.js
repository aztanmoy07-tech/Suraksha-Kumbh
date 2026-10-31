/**
 * SURAKSHA KUMBH 2026 - TACTICAL DISASTER MITIGATION & MESH SAFETY PLATFORM
 * COPYRIGHT (C) 2026 OJSHWIRAJ (TEAM SARAL). ALL RIGHTS RESERVED.
 * 
 * CORE CRYPTOGRAPHIC WATERMARK & SOURCE INTEGRITY SHIELD
 * UNAUTHORIZED CLONING, RE-BRANDING, OR TAMPERING IS STRICTLY PROHIBITED.
 */

(function () {
    'use strict';

    const CORE_SIGNATURE = "SURAKSHA-KUMBH-SECURE-NODE-2026-AUTH-OJSHWIRAJ";
    const AUTHOR_CREDIT = "OjshwiRaj (Team Saral)";
    const RELEASE_BUILD = "v2.6.4-TACTICAL-SECURE";

    // Freeze runtime integrity tokens
    try {
        Object.defineProperty(window, '__SURAKSHA_CORE_SIGNATURE__', {
            value: CORE_SIGNATURE,
            writable: false,
            configurable: false
        });
        Object.defineProperty(window, '__SURAKSHA_AUTHOR__', {
            value: AUTHOR_CREDIT,
            writable: false,
            configurable: false
        });
    } catch (e) {
        window.__SURAKSHA_CORE_SIGNATURE__ = CORE_SIGNATURE;
        window.__SURAKSHA_AUTHOR__ = AUTHOR_CREDIT;
    }

    // Console Security Banner
    const bannerStyle = 'color: #ea580c; font-weight: bold; font-size: 11px; background: #0f172a; padding: 6px 12px; border-radius: 6px;';
    console.log(
        `%c🛡️ SURAKSHA KUMBH 2026 | AUTHORIZED NODE: ${AUTHOR_CREDIT} | BUILD: ${RELEASE_BUILD}\n⚠️ Proprietary Tactical System: Direct cloning or unauthorized distribution is strictly restricted.`,
        bannerStyle
    );

    // Subtle Verified Node Badge in Footer
    function injectNodeBadge() {
        if (document.getElementById('suraksha-guard-badge')) return;
        const badge = document.createElement('div');
        badge.id = 'suraksha-guard-badge';
        badge.className = 'fixed bottom-2 right-2 z-[9999] pointer-events-none opacity-80 hover:opacity-100 transition-opacity';
        badge.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(249, 115, 22, 0.35); border-radius: 9999px; padding: 4px 10px; display: flex; items-center; gap: 6px; font-family: system-ui, sans-serif; font-size: 10px; color: #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <span style="display:inline-block; width:6px; height:6px; border-radius:9999px; background:#22c55e; box-shadow: 0 0 6px #22c55e;"></span>
                <span style="font-weight:700; color:#f97316;">SURAKSHA NODE</span>
                <span style="color:#64748b;">•</span>
                <span style="font-weight:600; color:#e2e8f0;">OjshwiRaj</span>
            </div>
        `;
        document.body.appendChild(badge);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNodeBadge);
    } else {
        injectNodeBadge();
    }
})();
