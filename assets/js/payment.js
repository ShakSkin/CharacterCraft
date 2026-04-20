/**
 * CharacterCraft Payment Engine
 * Part 1/2 — Core: Config, Address Loader, CoinGecko Pricing,
 *             Micro-Amount, Order Token, Session Management
 *
 * Load this file on every pay page:
 * <script src="/assets/js/payment.js"></script>
 */

(function (window) {
    'use strict';

    /* ═══════════════════════════════════════════════════════
       SECTION 1 — CONFIGURATION
    ═══════════════════════════════════════════════════════ */

    var CC = window.CharacterCraft = window.CharacterCraft || {};

    CC.config = {

        // ── Apps Script URL ──────────────────────────────
        appsScriptUrl: 'https://script.google.com/macros/s/AKfycbyriZDcNP_wPHktm7Uj6U54YTDAyEPjYPz8COpkjaTAHqnO6gO_oJ-oRvpgudW8w3NcqQ/exec',

        // ── Redirect after successful payment ───────────
        successUrl: '/success.html',

        // ── Order expiry (milliseconds) ──────────────────
        orderExpiryMs: 30 * 60 * 1000, // 30 minutes

        // ── Verification rate limit ──────────────────────
        maxVerifyAttempts: 5,
        verifyWindowMs: 10 * 60 * 1000, // 10 minutes

        // ── Amount tolerance for verification ────────────
        amountTolerancePct: 0.02, // ±2%

        // ── Price refresh interval ────────────────────────
        priceRefreshMs: 30 * 1000, // 30 seconds

        // ── Product prices (exact micro-amounts) ─────────
        products: {
            'aldric':         { label: 'Aldric — Grizzled Gate Captain',         price: 4.89870  },
            'dravek':         { label: 'Dravek — Corrupt Merchant',               price: 4.85589  },
            'city-bundle':    { label: 'City Bundle — Aldric + Dravek',           price: 8.47569  },
            'server-license': { label: 'Server License — 5 Characters',           price: 24.9989  },
            'retainer':       { label: 'Monthly Retainer',                        price: 39.10240 }
        },

        // ── Coin definitions ──────────────────────────────
        // Addresses are loaded dynamically from Google Sheets.
        // This object defines everything EXCEPT the address.
        coins: {
            BTC: {
                name:          'Bitcoin',
                ticker:        'BTC',
                icon:          '₿',
                network:       'BTC',
                networkFull:   'BTC Chain Only',
                minDeposit:    '0.00001000 BTC',
                confirmations: 1,
                coingeckoId:   'bitcoin',
                memo:          null,
                verifier:      'blockchair'
            },
            LTC: {
                name:          'Litecoin',
                ticker:        'LTC',
                icon:          'Ł',
                network:       'LTC',
                networkFull:   'LTC Chain Only',
                minDeposit:    '0.00000100 LTC',
                confirmations: 1,
                coingeckoId:   'litecoin',
                memo:          null,
                verifier:      'blockchair'
            },
            DOGE: {
                name:          'Dogecoin',
                ticker:        'DOGE',
                icon:          'Ð',
                network:       'DOGE',
                networkFull:   'DOGE Chain Only',
                minDeposit:    '0.00100000 DOGE',
                confirmations: 6,
                coingeckoId:   'dogecoin',
                memo:          null,
                verifier:      'blockchair'
            },
            BCH: {
                name:          'Bitcoin Cash',
                ticker:        'BCH',
                icon:          '₿',
                network:       'BCH',
                networkFull:   'BCH Chain Only',
                minDeposit:    '0.00000100 BCH',
                confirmations: 6,
                coingeckoId:   'bitcoin-cash',
                memo:          null,
                verifier:      'blockchair'
            },
            DASH: {
                name:          'Dash',
                ticker:        'DASH',
                icon:          'Đ',
                network:       'DASH',
                networkFull:   'DASH Chain Only',
                minDeposit:    '0.00000100 DASH',
                confirmations: 6,
                coingeckoId:   'dash',
                memo:          null,
                verifier:      'blockchair'
            },
            ZEC: {
                name:          'Zcash',
                ticker:        'ZEC',
                icon:          'ⓩ',
                network:       'ZEC',
                networkFull:   'ZEC Chain Only',
                minDeposit:    '0.00000010 ZEC',
                confirmations: 6,
                coingeckoId:   'zcash',
                memo:          null,
                verifier:      'blockchair'
            },
            XRP: {
                name:          'Ripple',
                ticker:        'XRP',
                icon:          '✕',
                network:       'XRP',
                networkFull:   'XRP Chain Only',
                minDeposit:    '0.00010000 XRP',
                confirmations: 1,
                coingeckoId:   'ripple',
                memo:          '1001897',
                memoLabel:     'Destination Tag',
                verifier:      'blockchair'
            },
            ADA: {
                name:          'Cardano',
                ticker:        'ADA',
                icon:          '₳',
                network:       'ADA',
                networkFull:   'ADA Chain Only',
                minDeposit:    '0.30000000 ADA',
                confirmations: 10,
                coingeckoId:   'cardano',
                memo:          null,
                verifier:      'blockchair'
            },
            BNB: {
                name:          'BNB',
                ticker:        'BNB',
                icon:          '🔶',
                network:       'BNB',
                networkFull:   'BNB Chain Only',
                minDeposit:    '0.00000100 BNB',
                confirmations: 6,
                coingeckoId:   'binancecoin',
                memo:          null,
                verifier:      'blockchair'
            },
            XLM: {
                name:          'Stellar',
                ticker:        'XLM',
                icon:          '✦',
                network:       'XLM',
                networkFull:   'XLM Chain Only',
                minDeposit:    '0.00500000 XLM',
                confirmations: 1,
                coingeckoId:   'stellar',
                memo:          '1001897',
                memoLabel:     'Memo',
                verifier:      'blockchair'
            },
            DGB: {
                name:          'DigiByte',
                ticker:        'DGB',
                icon:          '◆',
                network:       'DGB',
                networkFull:   'DGB Chain Only',
                minDeposit:    '0.00000100 DGB',
                confirmations: 6,
                coingeckoId:   'digibyte',
                memo:          null,
                verifier:      'blockcypher'
            },
            SOL: {
                name:          'Solana',
                ticker:        'SOL',
                icon:          '◎',
                network:       'SOL',
                networkFull:   'SOL Chain Only',
                minDeposit:    '0.00000100 SOL',
                confirmations: 21,
                coingeckoId:   'solana',
                memo:          null,
                verifier:      'solana'
            },
            USDC: {
                name:          'USD Coin',
                ticker:        'USDC',
                icon:          '💵',
                network:       'SOL',
                networkFull:   'SOL Chain Only',
                minDeposit:    '0.00100000 USDC',
                confirmations: 21,
                coingeckoId:   'usd-coin',
                memo:          null,
                verifier:      'solana-spl',
                // USDC mint on Solana mainnet
                splMint:       'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
            },
            TRX: {
                name:          'Tron',
                ticker:        'TRX',
                icon:          '🔺',
                network:       'TRX',
                networkFull:   'TRX Chain Only',
                minDeposit:    '0.00100000 TRX',
                confirmations: 1,
                coingeckoId:   'tron',
                memo:          null,
                verifier:      'tronscan'
            },
            USDT: {
                name:          'Tether (TRC-20)',
                ticker:        'USDT',
                icon:          '💲',
                network:       'TRX',
                networkFull:   'TRC-20 Chain Only',
                minDeposit:    '0.00500000 USDT',
                confirmations: 12,
                coingeckoId:   'tether',
                memo:          null,
                verifier:      'tronscan-trc20',
                // USDT TRC-20 contract
                trc20Contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
            }
        }
    };


    /* ═══════════════════════════════════════════════════════
       SECTION 2 — STATE
    ═══════════════════════════════════════════════════════ */

    CC.state = {
        addresses:        {},      // loaded from Google Sheets
        addressesLoaded:  false,
        selectedCoin:     null,
        orderToken:       null,
        orderCreatedAt:   null,
        exactAmount:      null,    // USD price for this product
        cryptoAmount:     null,    // calculated crypto amount
        priceTimer:       null,    // interval for price refresh
        expiryTimer:      null,    // interval for countdown
        product:          null,    // set by pay page
        prices:           {}       // coin → USD price cache
    };


    /* ═══════════════════════════════════════════════════════
       SECTION 3 — ADDRESS LOADER (Google Sheets via Apps Script)
    ═══════════════════════════════════════════════════════ */

    CC.loadAddresses = function () {
        return new Promise(function (resolve, reject) {

            // Return cached if already loaded
            if (CC.state.addressesLoaded && Object.keys(CC.state.addresses).length > 0) {
                resolve(CC.state.addresses);
                return;
            }

            var url = CC.config.appsScriptUrl + '?action=getAddresses';

            fetch(url)
                .then(function (res) {
                    if (!res.ok) throw new Error('Address fetch failed: ' + res.status);
                    return res.json();
                })
                .then(function (data) {
                    if (!data || typeof data !== 'object') {
                        throw new Error('Invalid address data received');
                    }
                    CC.state.addresses = data;
                    CC.state.addressesLoaded = true;
                    console.log('[CC] Addresses loaded:', Object.keys(data).length, 'coins');
                    resolve(data);
                })
                .catch(function (err) {
                    console.error('[CC] Address load failed:', err);
                    // Fail open with empty — UI will show error state
                    CC.state.addresses = {};
                    CC.state.addressesLoaded = false;
                    reject(err);
                });
        });
    };

    CC.getAddress = function (ticker) {
        var entry = CC.state.addresses[ticker];
        if (!entry) return null;
        return typeof entry === 'object' ? entry.address : entry;
    };


    /* ═══════════════════════════════════════════════════════
       SECTION 4 — COINGECKO PRICING
    ═══════════════════════════════════════════════════════ */

    CC.fetchPrices = function (tickers) {
        // Build CoinGecko IDs from config
        var ids = tickers.map(function (t) {
            var coin = CC.config.coins[t];
            return coin ? coin.coingeckoId : null;
        }).filter(Boolean);

        // Deduplicate (USDT and TRX both use tron chain, USDC and SOL both solana)
        ids = ids.filter(function (v, i, a) { return a.indexOf(v) === i; });

        var url = 'https://api.coingecko.com/api/v3/simple/price'
            + '?ids=' + ids.join(',')
            + '&vs_currencies=usd';

        return fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error('CoinGecko fetch failed: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                // Map back to tickers
                tickers.forEach(function (ticker) {
                    var coin = CC.config.coins[ticker];
                    if (!coin) return;
                    var priceData = data[coin.coingeckoId];
                    if (priceData && priceData.usd) {
                        CC.state.prices[ticker] = priceData.usd;
                    }
                });
                return CC.state.prices;
            });
    };

    CC.getCryptoAmount = function (ticker, usdAmount) {
        var price = CC.state.prices[ticker];
        if (!price || price <= 0) return null;
        // Round to 8 decimal places
        return Math.round((usdAmount / price) * 1e8) / 1e8;
    };


    /* ═══════════════════════════════════════════════════════
       SECTION 5 — MICRO-AMOUNT & ORDER TOKEN
    ═══════════════════════════════════════════════════════ */

    CC.initOrder = function (productKey) {
        var product = CC.config.products[productKey];
        if (!product) {
            console.error('[CC] Unknown product:', productKey);
            return null;
        }

        // Restore existing session if present and not expired
        var existing = CC.session.load();
        if (existing && existing.product === productKey) {
            var age = Date.now() - existing.createdAt;
            if (age < CC.config.orderExpiryMs) {
                CC.state.orderToken    = existing.token;
                CC.state.orderCreatedAt = existing.createdAt;
                CC.state.exactAmount   = existing.exactAmount;
                CC.state.product       = productKey;
                console.log('[CC] Restored existing session for', productKey);
                return existing;
            }
        }

        // Create new order
        var exactAmount   = product.price;
        var createdAt     = Date.now();
        var orderToken    = CC._generateToken(productKey, exactAmount, createdAt);

        CC.state.product       = productKey;
        CC.state.exactAmount   = exactAmount;
        CC.state.orderCreatedAt = createdAt;
        CC.state.orderToken    = orderToken;

        var orderData = {
            product:     productKey,
            label:       product.label,
            exactAmount: exactAmount,
            createdAt:   createdAt,
            token:       orderToken
        };

        CC.session.save(orderData);
        console.log('[CC] New order created:', productKey, 'amount:', exactAmount);
        return orderData;
    };

    CC._generateToken = function (productKey, amount, timestamp) {
        // Simple but sufficient: base64 of joined values + obfuscated checksum
        var raw = [productKey, amount.toFixed(5), timestamp].join('|');
        var checksum = 0;
        for (var i = 0; i < raw.length; i++) {
            checksum = ((checksum << 5) - checksum) + raw.charCodeAt(i);
            checksum |= 0;
        }
        return btoa(raw) + '.' + Math.abs(checksum).toString(16);
    };

    CC.validateToken = function (token, productKey, amount, createdAt) {
        var expected = CC._generateToken(productKey, amount, createdAt);
        return token === expected;
    };


    /* ═══════════════════════════════════════════════════════
       SECTION 6 — SESSION MANAGEMENT
    ═══════════════════════════════════════════════════════ */

    CC.session = {

        KEY: 'cc_order_session',

        save: function (data) {
            try {
                sessionStorage.setItem(CC.session.KEY, JSON.stringify(data));
            } catch (e) {
                console.warn('[CC] Session save failed:', e);
            }
        },

        load: function () {
            try {
                var raw = sessionStorage.getItem(CC.session.KEY);
                return raw ? JSON.parse(raw) : null;
            } catch (e) {
                return null;
            }
        },

        clear: function () {
            try {
                sessionStorage.removeItem(CC.session.KEY);
            } catch (e) {}
        }
    };


    /* ═══════════════════════════════════════════════════════
       SECTION 7 — RATE LIMITING
    ═══════════════════════════════════════════════════════ */

    CC.rateLimit = {

        KEY: 'cc_verify_attempts',

        check: function () {
            var attempts = CC.rateLimit._load();
            var now = Date.now();
            var window = CC.config.verifyWindowMs;
            var recent = attempts.filter(function (t) { return now - t < window; });

            if (recent.length >= CC.config.maxVerifyAttempts) {
                var oldest = Math.min.apply(null, recent);
                var waitSec = Math.ceil((window - (now - oldest)) / 1000);
                return {
                    allowed: false,
                    waitSeconds: waitSec,
                    message: 'Too many attempts. Please wait ' + waitSec + ' seconds.'
                };
            }

            return { allowed: true };
        },

        record: function () {
            var attempts = CC.rateLimit._load();
            var now = Date.now();
            var window = CC.config.verifyWindowMs;
            // Prune old entries
            attempts = attempts.filter(function (t) { return now - t < window; });
            attempts.push(now);
            try {
                localStorage.setItem(CC.rateLimit.KEY, JSON.stringify(attempts));
            } catch (e) {}
        },

        _load: function () {
            try {
                var raw = localStorage.getItem(CC.rateLimit.KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                return [];
            }
        }
    };


    /* ═══════════════════════════════════════════════════════
       SECTION 8 — ORDER EXPIRY TIMER
    ═══════════════════════════════════════════════════════ */

    CC.expiry = {

        start: function (createdAt, onTick, onExpire) {
            if (CC.state.expiryTimer) clearInterval(CC.state.expiryTimer);

            CC.state.expiryTimer = setInterval(function () {
                var elapsed = Date.now() - createdAt;
                var remaining = CC.config.orderExpiryMs - elapsed;

                if (remaining <= 0) {
                    clearInterval(CC.state.expiryTimer);
                    CC.session.clear();
                    if (typeof onExpire === 'function') onExpire();
                    return;
                }

                var min = Math.floor(remaining / 60000);
                var sec = Math.floor((remaining % 60000) / 1000);
                var display = CC._pad(min) + ':' + CC._pad(sec);
                if (typeof onTick === 'function') onTick(display, remaining);

            }, 1000);
        },

        stop: function () {
            if (CC.state.expiryTimer) {
                clearInterval(CC.state.expiryTimer);
                CC.state.expiryTimer = null;
            }
        }
    };


    /* ═══════════════════════════════════════════════════════
       SECTION 9 — UTILITY FUNCTIONS
    ═══════════════════════════════════════════════════════ */

    CC._pad = function (n) {
        return n < 10 ? '0' + n : '' + n;
    };

    CC.formatCrypto = function (amount, ticker) {
        if (amount === null || amount === undefined) return '—';
        // Show up to 8 decimal places, trim trailing zeros
        return parseFloat(amount.toFixed(8)) + ' ' + ticker;
    };

    CC.formatUSD = function (amount) {
        return '$' + amount.toFixed(5);
    };

    CC.copyToClipboard = function (text, btn, originalLabel) {
        var orig = originalLabel || btn.textContent;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                CC._showCopied(btn, orig);
            }).catch(function () {
                CC._fallbackCopy(text, btn, orig);
            });
        } else {
            CC._fallbackCopy(text, btn, orig);
        }
    };

    CC._fallbackCopy = function (text, btn, orig) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); CC._showCopied(btn, orig); }
        catch (e) { btn.textContent = 'Failed'; }
        document.body.removeChild(ta);
    };

    CC._showCopied = function (btn, orig) {
        btn.textContent = 'Copied!';
        btn.classList.add('cc-copied');
        setTimeout(function () {
            btn.textContent = orig;
            btn.classList.remove('cc-copied');
        }, 2000);
    };

    CC.honeypotCheck = function (formEl) {
        var honey = formEl.querySelector('[name="_honey"]');
        return honey && honey.value !== '';
    };

    console.log('[CharacterCraft] Payment engine Part 1 loaded.');

}(window));
/* ═══════════════════════════════════════════════════════
   SECTION 10 — BLOCKCHAIN VERIFICATION ENGINE
   Supports: Blockchair, Blockcypher, Solana RPC,
             Solana SPL, Tronscan, Tronscan TRC-20
═══════════════════════════════════════════════════════ */

CC.verify = {

    /* ── Main entry point ────────────────────────────────
       Called by UI when customer clicks "Verify Payment"
       Returns a Promise that resolves with a result object
    ─────────────────────────────────────────────────────*/
    run: function (txHash, ticker) {
        return new Promise(function (resolve, reject) {

            // ── Guard: rate limit ────────────────────────
            var rl = CC.rateLimit.check();
            if (!rl.allowed) {
                return reject({ code: 'RATE_LIMITED', message: rl.message });
            }
            CC.rateLimit.record();

            // ── Guard: order token present ───────────────
            if (!CC.state.orderToken || !CC.state.orderCreatedAt) {
                return reject({ code: 'NO_ORDER', message: 'No active order found. Please refresh and start again.' });
            }

            // ── Guard: order not expired ─────────────────
            var age = Date.now() - CC.state.orderCreatedAt;
            if (age > CC.config.orderExpiryMs) {
                CC.session.clear();
                return reject({ code: 'EXPIRED', message: 'Order expired. Please refresh the page to start a new order.' });
            }

            // ── Guard: TX hash format ────────────────────
            txHash = txHash.trim();
            if (!CC.verify._validateHashFormat(txHash, ticker)) {
                return reject({ code: 'INVALID_HASH', message: 'Transaction hash format is invalid for ' + ticker + '. Please check and try again.' });
            }

            // ── Guard: honeypot (checked upstream in UI) ─
            var coin    = CC.config.coins[ticker];
            var address = CC.getAddress(ticker);

            if (!coin) {
                return reject({ code: 'UNKNOWN_COIN', message: 'Unknown coin selected.' });
            }

            if (!address) {
                return reject({ code: 'NO_ADDRESS', message: 'Wallet address not available. Please try again in a moment.' });
            }

            // ── Route to correct verifier ────────────────
            var verifierFn = CC.verify._getVerifier(coin.verifier);
            if (!verifierFn) {
                return reject({ code: 'NO_VERIFIER', message: 'Verification not available for ' + ticker + '.' });
            }

            verifierFn(txHash, address, coin)
                .then(function (result) {
                    resolve(result);
                })
                .catch(function (err) {
                    reject(err);
                });
        });
    },

    /* ── Route to correct verifier function ─────────────*/
    _getVerifier: function (verifierKey) {
        var map = {
            'blockchair':     CC.verify._blockchair,
            'blockcypher':    CC.verify._blockcypher,
            'solana':         CC.verify._solana,
            'solana-spl':     CC.verify._solanaSpl,
            'tronscan':       CC.verify._tronscan,
            'tronscan-trc20': CC.verify._tronscanTrc20
        };
        return map[verifierKey] || null;
    },

    /* ── TX hash format validation ──────────────────────*/
    _validateHashFormat: function (hash, ticker) {
        var patterns = {
            BTC:  /^[a-fA-F0-9]{64}$/,
            LTC:  /^[a-fA-F0-9]{64}$/,
            DOGE: /^[a-fA-F0-9]{64}$/,
            BCH:  /^[a-fA-F0-9]{64}$/,
            DASH: /^[a-fA-F0-9]{64}$/,
            ZEC:  /^[a-fA-F0-9]{64}$/,
            XRP:  /^[A-F0-9]{64}$/i,
            ADA:  /^[a-fA-F0-9]{64}$/,
            BNB:  /^0x[a-fA-F0-9]{64}$/,
            XLM:  /^[a-fA-F0-9]{64}$/,
            DGB:  /^[a-fA-F0-9]{64}$/,
            SOL:  /^[1-9A-HJ-NP-Za-km-z]{87,88}$/,
            USDC: /^[1-9A-HJ-NP-Za-km-z]{87,88}$/,
            TRX:  /^[a-fA-F0-9]{64}$/,
            USDT: /^[a-fA-F0-9]{64}$/
        };
        var pattern = patterns[ticker];
        if (!pattern) return true; // Unknown coin — pass format check
        return pattern.test(hash);
    },

    /* ── Amount tolerance check ─────────────────────────*/
    _amountOk: function (received, expected) {
        if (!received || !expected) return false;
        var diff = Math.abs(received - expected);
        var tolerance = expected * CC.config.amountTolerancePct;
        return diff <= tolerance;
    },

    /* ── Blockchair (BTC LTC DOGE BCH DASH ZEC XRP ADA BNB XLM) ──*/
    _blockchair: function (txHash, address, coin) {
        // Blockchair chain names
        var chainMap = {
            BTC:  'bitcoin',
            LTC:  'litecoin',
            DOGE: 'dogecoin',
            BCH:  'bitcoin-cash',
            DASH: 'dash',
            ZEC:  'zcash',
            XRP:  'ripple',
            ADA:  'cardano',
            BNB:  'binance',
            XLM:  'stellar'
        };

        var chain = chainMap[coin.ticker];
        if (!chain) {
            return Promise.reject({
                code: 'CHAIN_MAP_MISSING',
                message: 'Chain not configured for ' + coin.ticker
            });
        }

        var url = 'https://api.blockchair.com/' + chain + '/transactions?q=hash(' + txHash + ')&limit=1';

        return fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error('Blockchair API error: ' + res.status);
                return res.json();
            })
            .then(function (data) {

                // ── TX not found ─────────────────────────
                if (!data.data || data.data.length === 0) {
                    return {
                        verified: false,
                        pending:  true,
                        code:     'TX_NOT_FOUND',
                        message:  'Transaction not found yet. It may still be propagating. Please wait 1-2 minutes and try again.'
                    };
                }

                var tx = data.data[0];

                // ── Confirmation check ───────────────────
                var confirmations = tx.block_id > 0 ? (data.context.state - tx.block_id + 1) : 0;
                if (confirmations < coin.confirmations) {
                    return {
                        verified:      false,
                        pending:       true,
                        code:          'INSUFFICIENT_CONFIRMATIONS',
                        confirmations: confirmations,
                        required:      coin.confirmations,
                        message:       'Transaction found but needs more confirmations. ' + confirmations + ' of ' + coin.confirmations + ' received. Please wait and try again.'
                    };
                }

                // ── Recipient address check ──────────────
                // Blockchair returns outputs — check if any output is to our address
                var outputs = tx.outputs || [];
                var ourOutput = null;

                // Normalize BCH address (strip bitcoincash: prefix for comparison)
                var normalizedAddress = address.replace('bitcoincash:', '');

                for (var i = 0; i < outputs.length; i++) {
                    var outAddr = (outputs[i].recipient || '').replace('bitcoincash:', '');
                    if (outAddr === normalizedAddress || outputs[i].recipient === address) {
                        ourOutput = outputs[i];
                        break;
                    }
                }

                if (!ourOutput) {
                    return {
                        verified: false,
                        pending:  false,
                        code:     'WRONG_RECIPIENT',
                        message:  'Transaction does not send to the correct address. Please check you sent to the right wallet.'
                    };
                }

                // ── Amount check ─────────────────────────
                // Blockchair returns value in satoshis/drops/lovelaces etc.
                var divisors = {
                    BTC: 1e8, LTC: 1e8, DOGE: 1e8, BCH: 1e8,
                    DASH: 1e8, ZEC: 1e8, XRP: 1e6, ADA: 1e6,
                    BNB: 1e8, XLM: 1e7
                };
                var divisor = divisors[coin.ticker] || 1e8;
                var receivedCrypto = ourOutput.value / divisor;
                var expectedCrypto = CC.state.cryptoAmount;

                if (!CC.verify._amountOk(receivedCrypto, expectedCrypto)) {
                    return {
                        verified:        false,
                        pending:         false,
                        code:            'WRONG_AMOUNT',
                        receivedCrypto:  receivedCrypto,
                        expectedCrypto:  expectedCrypto,
                        message:         'Amount mismatch. Expected ~' + expectedCrypto + ' ' + coin.ticker + ' but received ' + receivedCrypto + ' ' + coin.ticker + '. Please contact support.'
                    };
                }

                // ── All checks passed ────────────────────
                return {
                    verified:       true,
                    code:           'OK',
                    confirmations:  confirmations,
                    receivedCrypto: receivedCrypto,
                    txHash:         txHash,
                    message:        'Payment verified successfully.'
                };
            })
            .catch(function (err) {
                if (err.code) return Promise.reject(err);
                return Promise.reject({
                    code:    'API_ERROR',
                    message: 'Could not reach verification service. Please try again in a moment.',
                    detail:  err.message
                });
            });
    },

    /* ── Blockcypher (DGB) ──────────────────────────────*/
    _blockcypher: function (txHash, address, coin) {
        var chainMap = { DGB: 'dgb' };
        var chain = chainMap[coin.ticker];

        var url = 'https://api.blockcypher.com/v1/' + chain + '/main/txs/' + txHash + '?limit=50';

        return fetch(url)
            .then(function (res) {
                if (res.status === 404) {
                    return {
                        verified: false,
                        pending:  true,
                        code:     'TX_NOT_FOUND',
                        message:  'Transaction not found yet. Please wait and try again.'
                    };
                }
                if (!res.ok) throw new Error('Blockcypher error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (data.verified === false) return data;

                var confirmations = data.confirmations || 0;

                if (confirmations < coin.confirmations) {
                    return {
                        verified:      false,
                        pending:       true,
                        code:          'INSUFFICIENT_CONFIRMATIONS',
                        confirmations: confirmations,
                        required:      coin.confirmations,
                        message:       'Transaction found. ' + confirmations + ' of ' + coin.confirmations + ' confirmations. Please wait.'
                    };
                }

                // Check outputs for our address
                var outputs = data.outputs || [];
                var ourOutput = null;
                for (var i = 0; i < outputs.length; i++) {
                    var addrs = outputs[i].addresses || [];
                    if (addrs.indexOf(address) !== -1) {
                        ourOutput = outputs[i];
                        break;
                    }
                }

                if (!ourOutput) {
                    return {
                        verified: false,
                        pending:  false,
                        code:     'WRONG_RECIPIENT',
                        message:  'Transaction does not send to the correct address.'
                    };
                }

                var receivedCrypto = ourOutput.value / 1e8;
                var expectedCrypto = CC.state.cryptoAmount;

                if (!CC.verify._amountOk(receivedCrypto, expectedCrypto)) {
                    return {
                        verified:       false,
                        pending:        false,
                        code:           'WRONG_AMOUNT',
                        receivedCrypto: receivedCrypto,
                        expectedCrypto: expectedCrypto,
                        message:        'Amount mismatch. Expected ~' + expectedCrypto + ' ' + coin.ticker + ' but received ' + receivedCrypto + '.'
                    };
                }

                return {
                    verified:       true,
                    code:           'OK',
                    confirmations:  confirmations,
                    receivedCrypto: receivedCrypto,
                    txHash:         txHash,
                    message:        'Payment verified successfully.'
                };
            })
            .catch(function (err) {
                if (err.code) return Promise.reject(err);
                return Promise.reject({
                    code:    'API_ERROR',
                    message: 'Verification service unavailable. Please try again.',
                    detail:  err.message
                });
            });
    },

    /* ── Solana RPC (SOL) ───────────────────────────────*/
    _solana: function (txHash, address, coin) {
        var url = 'https://api.mainnet-beta.solana.com';

        var body = JSON.stringify({
            jsonrpc: '2.0',
            id:      1,
            method:  'getTransaction',
            params:  [
                txHash,
                { encoding: 'jsonParsed', commitment: 'confirmed', maxSupportedTransactionVersion: 0 }
            ]
        });

        return fetch(url, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    body
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Solana RPC error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (!data.result) {
                    return {
                        verified: false,
                        pending:  true,
                        code:     'TX_NOT_FOUND',
                        message:  'Transaction not found. Solana confirms quickly — please wait 30 seconds and try again.'
                    };
                }

                var tx = data.result;

                // Check confirmation status
                if (!tx.meta || tx.meta.err !== null) {
                    return {
                        verified: false,
                        pending:  false,
                        code:     'TX_FAILED',
                        message:  'Transaction failed on chain. Please send a new transaction.'
                    };
                }

                // Find our address in post-balances
                var accounts = tx.transaction.message.accountKeys || [];
                var preBalances  = tx.meta.preBalances  || [];
                var postBalances = tx.meta.postBalances || [];

                var ourIndex = -1;
                for (var i = 0; i < accounts.length; i++) {
                    var acct = accounts[i];
                    var key = typeof acct === 'string' ? acct : (acct.pubkey || '');
                    if (key === address) {
                        ourIndex = i;
                        break;
                    }
                }

                if (ourIndex === -1) {
                    return {
                        verified: false,
                        pending:  false,
                        code:     'WRONG_RECIPIENT',
                        message:  'Transaction does not send to the correct SOL address.'
                    };
                }

                // SOL amount in lamports (1 SOL = 1e9 lamports)
                var receivedLamports = postBalances[ourIndex] - preBalances[ourIndex];
                var receivedSol = receivedLamports / 1e9;
                var expectedSol = CC.state.cryptoAmount;

                if (!CC.verify._amountOk(receivedSol, expectedSol)) {
                    return {
                        verified:       false,
                        pending:        false,
                        code:           'WRONG_AMOUNT',
                        receivedCrypto: receivedSol,
                        expectedCrypto: expectedSol,
                        message:        'Amount mismatch. Expected ~' + expectedSol + ' SOL but received ' + receivedSol + ' SOL.'
                    };
                }

                return {
                    verified:       true,
                    code:           'OK',
                    confirmations:  'confirmed',
                    receivedCrypto: receivedSol,
                    txHash:         txHash,
                    message:        'Payment verified successfully.'
                };
            })
            .catch(function (err) {
                if (err.code) return Promise.reject(err);
                return Promise.reject({
                    code:    'API_ERROR',
                    message: 'Solana RPC unavailable. Please try again.',
                    detail:  err.message
                });
            });
    },

    /* ── Solana SPL Token (USDC on SOL) ─────────────────*/
    _solanaSpl: function (txHash, address, coin) {
        var url = 'https://api.mainnet-beta.solana.com';

        var body = JSON.stringify({
            jsonrpc: '2.0',
            id:      1,
            method:  'getTransaction',
            params:  [
                txHash,
                { encoding: 'jsonParsed', commitment: 'confirmed', maxSupportedTransactionVersion: 0 }
            ]
        });

        return fetch(url, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    body
        })
            .then(function (res) {
                if (!res.ok) throw new Error('Solana RPC error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (!data.result) {
                    return {
                        verified: false,
                        pending:  true,
                        code:     'TX_NOT_FOUND',
                        message:  'Transaction not found. Please wait 30 seconds and try again.'
                    };
                }

                var tx = data.result;

                if (!tx.meta || tx.meta.err !== null) {
                    return {
                        verified: false,
                        pending:  false,
                        code:     'TX_FAILED',
                        message:  'Transaction failed on chain.'
                    };
                }

                // Look through token balance changes
                var postTokenBalances = tx.meta.postTokenBalances || [];
                var preTokenBalances  = tx.meta.preTokenBalances  || [];
                var splMint = coin.splMint;

                // Find our address in token balances for the correct mint
                var ourPost = null;
                var ourPre  = null;

                postTokenBalances.forEach(function (b) {
                    if (b.mint === splMint && b.owner === address) {
                        ourPost = b;
                    }
                });

                preTokenBalances.forEach(function (b) {
                    if (b.mint === splMint && b.owner === address) {
                        ourPre = b;
                    }
                });

                if (!ourPost) {
                    return {
                        verified: false,
                        pending:  false,
                        code:     'WRONG_RECIPIENT',
                        message:  'USDC not sent to the correct address, or wrong token sent.'
                    };
                }

                var postAmount = parseFloat(ourPost.uiTokenAmount.uiAmountString || 0);
                var preAmount  = ourPre ? parseFloat(ourPre.uiTokenAmount.uiAmountString || 0) : 0;
                var received   = postAmount - preAmount;
                var expected   = CC.state.cryptoAmount;

                if (!CC.verify._amountOk(received, expected)) {
                    return {
                        verified:       false,
                        pending:        false,
                        code:           'WRONG_AMOUNT',
                        receivedCrypto: received,
                        expectedCrypto: expected,
                        message:        'Amount mismatch. Expected ~' + expected + ' USDC but received ' + received + ' USDC.'
                    };
                }

                return {
                    verified:       true,
                    code:           'OK',
                    confirmations:  'confirmed',
                    receivedCrypto: received,
                    txHash:         txHash,
                    message:        'Payment verified successfully.'
                };
            })
            .catch(function (err) {
                if (err.code) return Promise.reject(err);
                return Promise.reject({
                    code:    'API_ERROR',
                    message: 'Solana RPC unavailable. Please try again.',
                    detail:  err.message
                });
            });
    },

    /* ── Tronscan (TRX) ─────────────────────────────────*/
    _tronscan: function (txHash, address, coin) {
        var url = 'https://apilist.tronscanapi.com/api/transaction-info?hash=' + txHash;

        return fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error('Tronscan error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (!data || !data.hash) {
                    return {
                        verified: false,
                        pending:  true,
                        code:     'TX_NOT_FOUND',
                        message:  'Transaction not found. TRX confirms quickly — please wait 30 seconds and try again.'
                    };
                }

                var confirmations = data.confirmations || 0;

                if (confirmations < coin.confirmations) {
                    return {
                        verified:      false,
                        pending:       true,
                        code:          'INSUFFICIENT_CONFIRMATIONS',
                        confirmations: confirmations,
                        required:      coin.confirmations,
                        message:       'Waiting for confirmations: ' + confirmations + ' of ' + coin.confirmations + '.'
                    };
                }

                // Check contract data for TRX transfer
                var contractData = (data.contractData || {});
                var toAddress = contractData.to_address || data.toAddress || '';

                if (toAddress !== address) {
                    return {
                        verified: false,
                        pending:  false,
                        code:     'WRONG_RECIPIENT',
                        message:  'Transaction does not send to the correct TRX address.'
                    };
                }

                // TRX amount in SUN (1 TRX = 1,000,000 SUN)
                var amountSun  = contractData.amount || 0;
                var receivedTrx = amountSun / 1e6;
                var expectedTrx = CC.state.cryptoAmount;

                if (!CC.verify._amountOk(receivedTrx, expectedTrx)) {
                    return {
                        verified:       false,
                        pending:        false,
                        code:           'WRONG_AMOUNT',
                        receivedCrypto: receivedTrx,
                        expectedCrypto: expectedTrx,
                        message:        'Amount mismatch. Expected ~' + expectedTrx + ' TRX but received ' + receivedTrx + '.'
                    };
                }

                return {
                    verified:       true,
                    code:           'OK',
                    confirmations:  confirmations,
                    receivedCrypto: receivedTrx,
                    txHash:         txHash,
                    message:        'Payment verified successfully.'
                };
            })
            .catch(function (err) {
                if (err.code) return Promise.reject(err);
                return Promise.reject({
                    code:    'API_ERROR',
                    message: 'Tronscan unavailable. Please try again.',
                    detail:  err.message
                });
            });
    },

    /* ── Tronscan TRC-20 (USDT) ─────────────────────────*/
    _tronscanTrc20: function (txHash, address, coin) {
        var url = 'https://apilist.tronscanapi.com/api/transaction-info?hash=' + txHash;

        return fetch(url)
            .then(function (res) {
                if (!res.ok) throw new Error('Tronscan TRC-20 error: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                if (!data || !data.hash) {
                    return {
                        verified: false,
                        pending:  true,
                        code:     'TX_NOT_FOUND',
                        message:  'Transaction not found. Please wait and try again.'
                    };
                }

                var confirmations = data.confirmations || 0;

                if (confirmations < coin.confirmations) {
                    return {
                        verified:      false,
                        pending:       true,
                        code:          'INSUFFICIENT_CONFIRMATIONS',
                        confirmations: confirmations,
                        required:      coin.confirmations,
                        message:       'Waiting for confirmations: ' + confirmations + ' of ' + coin.confirmations + '.'
                    };
                }

                // TRC-20 transfers are in trc20TransferInfo
                var transfers = data.trc20TransferInfo || [];
                var ourTransfer = null;

                for (var i = 0; i < transfers.length; i++) {
                    var t = transfers[i];
                    if (t.to_address === address && t.contract_address === coin.trc20Contract) {
                        ourTransfer = t;
                        break;
                    }
                }

                if (!ourTransfer) {
                    return {
                        verified: false,
                        pending:  false,
                        code:     'WRONG_RECIPIENT',
                        message:  'USDT not sent to the correct TRC-20 address, or wrong token sent.'
                    };
                }

                // USDT TRC-20 has 6 decimal places
                var receivedUsdt = parseFloat(ourTransfer.amount_str || ourTransfer.amount) / 1e6;
                var expectedUsdt = CC.state.cryptoAmount;

                if (!CC.verify._amountOk(receivedUsdt, expectedUsdt)) {
                    return {
                        verified:       false,
                        pending:        false,
                        code:           'WRONG_AMOUNT',
                        receivedCrypto: receivedUsdt,
                        expectedCrypto: expectedUsdt,
                        message:        'Amount mismatch. Expected ~' + expectedUsdt + ' USDT but received ' + receivedUsdt + '.'
                    };
                }

                return {
                    verified:       true,
                    code:           'OK',
                    confirmations:  confirmations,
                    receivedCrypto: receivedUsdt,
                    txHash:         txHash,
                    message:        'Payment verified successfully.'
                };
            })
            .catch(function (err) {
                if (err.code) return Promise.reject(err);
                return Promise.reject({
                    code:    'API_ERROR',
                    message: 'Tronscan unavailable. Please try again.',
                    detail:  err.message
                });
            });
    }

};


/* ═══════════════════════════════════════════════════════
   SECTION 11 — APPS SCRIPT SUBMISSION
   Posts verified order to Apps Script for:
   - Duplicate TX hash check
   - Google Sheets logging
   - Discord notification
═══════════════════════════════════════════════════════ */

CC.submitOrder = function (verificationResult, formData) {
    return new Promise(function (resolve, reject) {

        var payload = {
            source:          'charactercraft_payment',
            product:         CC.state.product,
            productLabel:    (CC.config.products[CC.state.product] || {}).label || '',
            coin:            CC.state.selectedCoin,
            exactAmountUsd:  CC.state.exactAmount,
            cryptoAmount:    CC.state.cryptoAmount,
            txHash:          verificationResult.txHash,
            confirmations:   verificationResult.confirmations,
            contact:         formData.contact  || '',
            notes:           formData.notes    || '',
            orderToken:      CC.state.orderToken,
            orderCreatedAt:  CC.state.orderCreatedAt,
            verifiedAt:      Date.now()
        };

        fetch(CC.config.appsScriptUrl, {
            method:  'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body:    CC._encodeForm(payload)
        })
            .then(function (res) { return res.text(); })
            .then(function (text) {
                var result;
                try { result = JSON.parse(text); }
                catch (e) { result = { status: text }; }

                if (result.error === 'DUPLICATE_TX') {
                    return reject({
                        code:    'DUPLICATE_TX',
                        message: 'This transaction hash has already been used for a previous order. Please contact support if this is an error.'
                    });
                }

                if (result.error === 'INVALID_TOKEN') {
                    return reject({
                        code:    'INVALID_TOKEN',
                        message: 'Order validation failed. Please refresh and try again.'
                    });
                }

                resolve(result);
            })
            .catch(function (err) {
                reject({
                    code:    'SUBMIT_ERROR',
                    message: 'Could not submit order. Please contact support with your transaction hash.',
                    detail:  err.message
                });
            });
    });
};

CC._encodeForm = function (obj) {
    return Object.keys(obj).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(obj[k] === null || obj[k] === undefined ? '' : obj[k]);
    }).join('&');
};


/* ═══════════════════════════════════════════════════════
   SECTION 12 — POLLING RETRY
   For coins that may not appear immediately on explorer
   Retries verification every 15 seconds up to 10 times
═══════════════════════════════════════════════════════ */

CC.poll = {

    _timer:    null,
    _attempts: 0,
    MAX:       10,
    INTERVAL:  15000, // 15 seconds

    start: function (txHash, ticker, onResult, onMaxReached) {
        CC.poll.stop();
        CC.poll._attempts = 0;

        CC.poll._timer = setInterval(function () {
            CC.poll._attempts++;

            if (CC.poll._attempts > CC.poll.MAX) {
                CC.poll.stop();
                if (typeof onMaxReached === 'function') onMaxReached();
                return;
            }

            // Run verification without recording a rate-limit attempt
            // (polling is automated, not customer-initiated)
            var coin    = CC.config.coins[ticker];
            var address = CC.getAddress(ticker);
            var verifierFn = CC.verify._getVerifier(coin.verifier);

            if (!verifierFn) {
                CC.poll.stop();
                return;
            }

            verifierFn(txHash, address, coin)
                .then(function (result) {
                    if (typeof onResult === 'function') onResult(result);
                    if (result.verified) CC.poll.stop();
                })
                .catch(function () {
                    // Silent retry on poll errors
                });

        }, CC.poll.INTERVAL);
    },

    stop: function () {
        if (CC.poll._timer) {
            clearInterval(CC.poll._timer);
            CC.poll._timer = null;
        }
        CC.poll._attempts = 0;
    }
};

console.log('[CharacterCraft] Payment engine Part 2 loaded. Engine ready.');
