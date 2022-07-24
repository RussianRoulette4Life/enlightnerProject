
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/sideBar.svelte generated by Svelte v3.48.0 */

    const file$4 = "src/sideBar.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (15:0) {#if appear}
    function create_if_block$2(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*allSideElems*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*Elem*/ ctx[4].number;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "MY TWITTER CLONE";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$4, 17, 12, 588);
    			attr_dev(div0, "class", "logo svelte-bdlc7j");
    			add_location(div0, file$4, 16, 8, 557);
    			attr_dev(div1, "class", "sideBar svelte-bdlc7j");
    			add_location(div1, file$4, 15, 4, 527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*handleOpen, allSideElems*/ 5) {
    				each_value = /*allSideElems*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(15:0) {#if appear}",
    		ctx
    	});

    	return block;
    }

    // (27:16) {:else}
    function create_else_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "!Click for more info!";
    			set_style(p, "font-size", "10pt");
    			add_location(p, file$4, 27, 16, 1102);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(27:16) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:16) {#if Elem.showExtra}
    function create_if_block_1(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*Elem*/ ctx[4].extraContent;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*allSideElems*/ 1) {
    				each_value_1 = /*Elem*/ ctx[4].extraContent;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(23:16) {#if Elem.showExtra}",
    		ctx
    	});

    	return block;
    }

    // (24:20) {#each Elem.extraContent as extraContentNugget}
    function create_each_block_1(ctx) {
    	let div;
    	let p;
    	let t_value = /*extraContentNugget*/ ctx[7] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$4, 24, 55, 1000);
    			attr_dev(div, "class", "selectableSegment svelte-bdlc7j");
    			add_location(div, file$4, 24, 24, 969);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*allSideElems*/ 1 && t_value !== (t_value = /*extraContentNugget*/ ctx[7] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(24:20) {#each Elem.extraContent as extraContentNugget}",
    		ctx
    	});

    	return block;
    }

    // (20:8) {#each allSideElems as Elem (Elem.number)}
    function create_each_block(key_1, ctx) {
    	let div;
    	let h1;
    	let t0_value = /*Elem*/ ctx[4].number + 1 + "";
    	let t0;
    	let t1;
    	let t2_value = /*Elem*/ ctx[4].content + "";
    	let t2;
    	let t3;
    	let t4;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*Elem*/ ctx[4].showExtra) return create_if_block_1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*Elem*/ ctx[4], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = text(". ");
    			t2 = text(t2_value);
    			t3 = space();
    			if_block.c();
    			t4 = space();
    			set_style(h1, "text-align", "center");
    			add_location(h1, file$4, 21, 16, 771);
    			attr_dev(div, "class", "sideElem svelte-bdlc7j");
    			add_location(div, file$4, 20, 12, 692);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(div, t3);
    			if_block.m(div, null);
    			append_dev(div, t4);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*allSideElems*/ 1 && t0_value !== (t0_value = /*Elem*/ ctx[4].number + 1 + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*allSideElems*/ 1 && t2_value !== (t2_value = /*Elem*/ ctx[4].content + "")) set_data_dev(t2, t2_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t4);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(20:8) {#each allSideElems as Elem (Elem.number)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let if_block_anchor;
    	let if_block = /*appear*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*appear*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SideBar', slots, []);
    	let { appear = true } = $$props;
    	let { allSideElems = [] } = $$props;

    	const handleOpen = number => {
    		//allSideElems.forEach(element => {
    		//    if (element.number === number){
    		//        element.showExtra =! element.showExtra
    		//        console.log(`element number ${element.number}, number var passed to func = ${number}${element.showExtra}`)
    		//    }
    		//}
    		//)
    		$$invalidate(0, allSideElems[number].showExtra = !allSideElems[number].showExtra, allSideElems);
    	};

    	const writable_props = ['appear', 'allSideElems'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SideBar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (Elem, e) => handleOpen(Elem.number);

    	$$self.$$set = $$props => {
    		if ('appear' in $$props) $$invalidate(1, appear = $$props.appear);
    		if ('allSideElems' in $$props) $$invalidate(0, allSideElems = $$props.allSideElems);
    	};

    	$$self.$capture_state = () => ({ appear, allSideElems, handleOpen });

    	$$self.$inject_state = $$props => {
    		if ('appear' in $$props) $$invalidate(1, appear = $$props.appear);
    		if ('allSideElems' in $$props) $$invalidate(0, allSideElems = $$props.allSideElems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [allSideElems, appear, handleOpen, click_handler];
    }

    class SideBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { appear: 1, allSideElems: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SideBar",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get appear() {
    		throw new Error("<SideBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appear(value) {
    		throw new Error("<SideBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get allSideElems() {
    		throw new Error("<SideBar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set allSideElems(value) {
    		throw new Error("<SideBar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/content.svelte generated by Svelte v3.48.0 */

    const file$3 = "src/content.svelte";

    function create_fragment$3(ctx) {
    	let div16;
    	let div0;
    	let header0;
    	let h10;
    	let t1;
    	let p0;
    	let t3;
    	let div1;
    	let header1;
    	let h11;
    	let t5;
    	let p1;
    	let t7;
    	let div2;
    	let header2;
    	let h12;
    	let t9;
    	let p2;
    	let t11;
    	let div3;
    	let header3;
    	let h13;
    	let t13;
    	let p3;
    	let t15;
    	let div4;
    	let header4;
    	let h14;
    	let t17;
    	let p4;
    	let t19;
    	let div5;
    	let header5;
    	let h15;
    	let t21;
    	let p5;
    	let t23;
    	let div6;
    	let header6;
    	let h16;
    	let t25;
    	let p6;
    	let t27;
    	let div7;
    	let header7;
    	let h17;
    	let t29;
    	let p7;
    	let t31;
    	let div8;
    	let header8;
    	let h18;
    	let t33;
    	let p8;
    	let t35;
    	let div9;
    	let header9;
    	let h19;
    	let t37;
    	let p9;
    	let t39;
    	let div10;
    	let header10;
    	let h110;
    	let t41;
    	let p10;
    	let t43;
    	let div11;
    	let header11;
    	let h111;
    	let t45;
    	let p11;
    	let t47;
    	let div12;
    	let header12;
    	let h112;
    	let t49;
    	let p12;
    	let t51;
    	let div13;
    	let header13;
    	let h113;
    	let t53;
    	let p13;
    	let t55;
    	let div14;
    	let header14;
    	let h114;
    	let t57;
    	let p14;
    	let t59;
    	let div15;
    	let header15;
    	let h115;
    	let t61;
    	let p15;

    	const block = {
    		c: function create() {
    			div16 = element("div");
    			div0 = element("div");
    			header0 = element("header");
    			h10 = element("h1");
    			h10.textContent = "lorem ipsum";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t3 = space();
    			div1 = element("div");
    			header1 = element("header");
    			h11 = element("h1");
    			h11.textContent = "lorem ipsum";
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t7 = space();
    			div2 = element("div");
    			header2 = element("header");
    			h12 = element("h1");
    			h12.textContent = "lorem ipsum";
    			t9 = space();
    			p2 = element("p");
    			p2.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t11 = space();
    			div3 = element("div");
    			header3 = element("header");
    			h13 = element("h1");
    			h13.textContent = "lorem ipsum";
    			t13 = space();
    			p3 = element("p");
    			p3.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t15 = space();
    			div4 = element("div");
    			header4 = element("header");
    			h14 = element("h1");
    			h14.textContent = "lorem ipsum";
    			t17 = space();
    			p4 = element("p");
    			p4.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t19 = space();
    			div5 = element("div");
    			header5 = element("header");
    			h15 = element("h1");
    			h15.textContent = "lorem ipsum";
    			t21 = space();
    			p5 = element("p");
    			p5.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t23 = space();
    			div6 = element("div");
    			header6 = element("header");
    			h16 = element("h1");
    			h16.textContent = "lorem ipsum";
    			t25 = space();
    			p6 = element("p");
    			p6.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t27 = space();
    			div7 = element("div");
    			header7 = element("header");
    			h17 = element("h1");
    			h17.textContent = "lorem ipsum";
    			t29 = space();
    			p7 = element("p");
    			p7.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t31 = space();
    			div8 = element("div");
    			header8 = element("header");
    			h18 = element("h1");
    			h18.textContent = "lorem ipsum";
    			t33 = space();
    			p8 = element("p");
    			p8.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t35 = space();
    			div9 = element("div");
    			header9 = element("header");
    			h19 = element("h1");
    			h19.textContent = "lorem ipsum";
    			t37 = space();
    			p9 = element("p");
    			p9.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t39 = space();
    			div10 = element("div");
    			header10 = element("header");
    			h110 = element("h1");
    			h110.textContent = "lorem ipsum";
    			t41 = space();
    			p10 = element("p");
    			p10.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t43 = space();
    			div11 = element("div");
    			header11 = element("header");
    			h111 = element("h1");
    			h111.textContent = "lorem ipsum";
    			t45 = space();
    			p11 = element("p");
    			p11.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t47 = space();
    			div12 = element("div");
    			header12 = element("header");
    			h112 = element("h1");
    			h112.textContent = "lorem ipsum";
    			t49 = space();
    			p12 = element("p");
    			p12.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t51 = space();
    			div13 = element("div");
    			header13 = element("header");
    			h113 = element("h1");
    			h113.textContent = "lorem ipsum";
    			t53 = space();
    			p13 = element("p");
    			p13.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t55 = space();
    			div14 = element("div");
    			header14 = element("header");
    			h114 = element("h1");
    			h114.textContent = "lorem ipsum";
    			t57 = space();
    			p14 = element("p");
    			p14.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			t59 = space();
    			div15 = element("div");
    			header15 = element("header");
    			h115 = element("h1");
    			h115.textContent = "lorem ipsum";
    			t61 = space();
    			p15 = element("p");
    			p15.textContent = "Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum laudantium reiciendis non, aut nam nobis, est magnam sed itaque ex possimus tenetur accusamus quo labore facilis quidem sint aspernatur inventore.";
    			add_location(h10, file$3, 15, 16, 329);
    			attr_dev(header0, "class", "svelte-v9yi79");
    			add_location(header0, file$3, 15, 8, 321);
    			attr_dev(p0, "class", "svelte-v9yi79");
    			add_location(p0, file$3, 16, 8, 367);
    			attr_dev(div0, "class", "tweet svelte-v9yi79");
    			add_location(div0, file$3, 14, 4, 293);
    			add_location(h11, file$3, 19, 16, 637);
    			attr_dev(header1, "class", "svelte-v9yi79");
    			add_location(header1, file$3, 19, 8, 629);
    			attr_dev(p1, "class", "svelte-v9yi79");
    			add_location(p1, file$3, 20, 8, 675);
    			attr_dev(div1, "class", "tweet svelte-v9yi79");
    			add_location(div1, file$3, 18, 8, 601);
    			add_location(h12, file$3, 23, 16, 941);
    			attr_dev(header2, "class", "svelte-v9yi79");
    			add_location(header2, file$3, 23, 8, 933);
    			attr_dev(p2, "class", "svelte-v9yi79");
    			add_location(p2, file$3, 24, 8, 979);
    			attr_dev(div2, "class", "tweet svelte-v9yi79");
    			add_location(div2, file$3, 22, 4, 905);
    			add_location(h13, file$3, 27, 16, 1249);
    			attr_dev(header3, "class", "svelte-v9yi79");
    			add_location(header3, file$3, 27, 8, 1241);
    			attr_dev(p3, "class", "svelte-v9yi79");
    			add_location(p3, file$3, 28, 8, 1287);
    			attr_dev(div3, "class", "tweet svelte-v9yi79");
    			add_location(div3, file$3, 26, 8, 1213);
    			add_location(h14, file$3, 31, 16, 1553);
    			attr_dev(header4, "class", "svelte-v9yi79");
    			add_location(header4, file$3, 31, 8, 1545);
    			attr_dev(p4, "class", "svelte-v9yi79");
    			add_location(p4, file$3, 32, 8, 1591);
    			attr_dev(div4, "class", "tweet svelte-v9yi79");
    			add_location(div4, file$3, 30, 4, 1517);
    			add_location(h15, file$3, 35, 16, 1861);
    			attr_dev(header5, "class", "svelte-v9yi79");
    			add_location(header5, file$3, 35, 8, 1853);
    			attr_dev(p5, "class", "svelte-v9yi79");
    			add_location(p5, file$3, 36, 8, 1899);
    			attr_dev(div5, "class", "tweet svelte-v9yi79");
    			add_location(div5, file$3, 34, 8, 1825);
    			add_location(h16, file$3, 39, 16, 2165);
    			attr_dev(header6, "class", "svelte-v9yi79");
    			add_location(header6, file$3, 39, 8, 2157);
    			attr_dev(p6, "class", "svelte-v9yi79");
    			add_location(p6, file$3, 40, 8, 2203);
    			attr_dev(div6, "class", "tweet svelte-v9yi79");
    			add_location(div6, file$3, 38, 4, 2129);
    			add_location(h17, file$3, 43, 16, 2473);
    			attr_dev(header7, "class", "svelte-v9yi79");
    			add_location(header7, file$3, 43, 8, 2465);
    			attr_dev(p7, "class", "svelte-v9yi79");
    			add_location(p7, file$3, 44, 8, 2511);
    			attr_dev(div7, "class", "tweet svelte-v9yi79");
    			add_location(div7, file$3, 42, 8, 2437);
    			add_location(h18, file$3, 47, 16, 2777);
    			attr_dev(header8, "class", "svelte-v9yi79");
    			add_location(header8, file$3, 47, 8, 2769);
    			attr_dev(p8, "class", "svelte-v9yi79");
    			add_location(p8, file$3, 48, 8, 2815);
    			attr_dev(div8, "class", "tweet svelte-v9yi79");
    			add_location(div8, file$3, 46, 4, 2741);
    			add_location(h19, file$3, 51, 16, 3085);
    			attr_dev(header9, "class", "svelte-v9yi79");
    			add_location(header9, file$3, 51, 8, 3077);
    			attr_dev(p9, "class", "svelte-v9yi79");
    			add_location(p9, file$3, 52, 8, 3123);
    			attr_dev(div9, "class", "tweet svelte-v9yi79");
    			add_location(div9, file$3, 50, 8, 3049);
    			add_location(h110, file$3, 55, 16, 3389);
    			attr_dev(header10, "class", "svelte-v9yi79");
    			add_location(header10, file$3, 55, 8, 3381);
    			attr_dev(p10, "class", "svelte-v9yi79");
    			add_location(p10, file$3, 56, 8, 3427);
    			attr_dev(div10, "class", "tweet svelte-v9yi79");
    			add_location(div10, file$3, 54, 4, 3353);
    			add_location(h111, file$3, 59, 16, 3697);
    			attr_dev(header11, "class", "svelte-v9yi79");
    			add_location(header11, file$3, 59, 8, 3689);
    			attr_dev(p11, "class", "svelte-v9yi79");
    			add_location(p11, file$3, 60, 8, 3735);
    			attr_dev(div11, "class", "tweet svelte-v9yi79");
    			add_location(div11, file$3, 58, 8, 3661);
    			add_location(h112, file$3, 63, 16, 4001);
    			attr_dev(header12, "class", "svelte-v9yi79");
    			add_location(header12, file$3, 63, 8, 3993);
    			attr_dev(p12, "class", "svelte-v9yi79");
    			add_location(p12, file$3, 64, 8, 4039);
    			attr_dev(div12, "class", "tweet svelte-v9yi79");
    			add_location(div12, file$3, 62, 4, 3965);
    			add_location(h113, file$3, 67, 16, 4309);
    			attr_dev(header13, "class", "svelte-v9yi79");
    			add_location(header13, file$3, 67, 8, 4301);
    			attr_dev(p13, "class", "svelte-v9yi79");
    			add_location(p13, file$3, 68, 8, 4347);
    			attr_dev(div13, "class", "tweet svelte-v9yi79");
    			add_location(div13, file$3, 66, 8, 4273);
    			add_location(h114, file$3, 71, 16, 4613);
    			attr_dev(header14, "class", "svelte-v9yi79");
    			add_location(header14, file$3, 71, 8, 4605);
    			attr_dev(p14, "class", "svelte-v9yi79");
    			add_location(p14, file$3, 72, 8, 4651);
    			attr_dev(div14, "class", "tweet svelte-v9yi79");
    			add_location(div14, file$3, 70, 4, 4577);
    			add_location(h115, file$3, 75, 16, 4921);
    			attr_dev(header15, "class", "svelte-v9yi79");
    			add_location(header15, file$3, 75, 8, 4913);
    			attr_dev(p15, "class", "svelte-v9yi79");
    			add_location(p15, file$3, 76, 8, 4959);
    			attr_dev(div15, "class", "tweet svelte-v9yi79");
    			add_location(div15, file$3, 74, 8, 4885);
    			attr_dev(div16, "class", "content svelte-v9yi79");
    			add_location(div16, file$3, 13, 0, 267);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div16, anchor);
    			append_dev(div16, div0);
    			append_dev(div0, header0);
    			append_dev(header0, h10);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div16, t3);
    			append_dev(div16, div1);
    			append_dev(div1, header1);
    			append_dev(header1, h11);
    			append_dev(div1, t5);
    			append_dev(div1, p1);
    			append_dev(div16, t7);
    			append_dev(div16, div2);
    			append_dev(div2, header2);
    			append_dev(header2, h12);
    			append_dev(div2, t9);
    			append_dev(div2, p2);
    			append_dev(div16, t11);
    			append_dev(div16, div3);
    			append_dev(div3, header3);
    			append_dev(header3, h13);
    			append_dev(div3, t13);
    			append_dev(div3, p3);
    			append_dev(div16, t15);
    			append_dev(div16, div4);
    			append_dev(div4, header4);
    			append_dev(header4, h14);
    			append_dev(div4, t17);
    			append_dev(div4, p4);
    			append_dev(div16, t19);
    			append_dev(div16, div5);
    			append_dev(div5, header5);
    			append_dev(header5, h15);
    			append_dev(div5, t21);
    			append_dev(div5, p5);
    			append_dev(div16, t23);
    			append_dev(div16, div6);
    			append_dev(div6, header6);
    			append_dev(header6, h16);
    			append_dev(div6, t25);
    			append_dev(div6, p6);
    			append_dev(div16, t27);
    			append_dev(div16, div7);
    			append_dev(div7, header7);
    			append_dev(header7, h17);
    			append_dev(div7, t29);
    			append_dev(div7, p7);
    			append_dev(div16, t31);
    			append_dev(div16, div8);
    			append_dev(div8, header8);
    			append_dev(header8, h18);
    			append_dev(div8, t33);
    			append_dev(div8, p8);
    			append_dev(div16, t35);
    			append_dev(div16, div9);
    			append_dev(div9, header9);
    			append_dev(header9, h19);
    			append_dev(div9, t37);
    			append_dev(div9, p9);
    			append_dev(div16, t39);
    			append_dev(div16, div10);
    			append_dev(div10, header10);
    			append_dev(header10, h110);
    			append_dev(div10, t41);
    			append_dev(div10, p10);
    			append_dev(div16, t43);
    			append_dev(div16, div11);
    			append_dev(div11, header11);
    			append_dev(header11, h111);
    			append_dev(div11, t45);
    			append_dev(div11, p11);
    			append_dev(div16, t47);
    			append_dev(div16, div12);
    			append_dev(div12, header12);
    			append_dev(header12, h112);
    			append_dev(div12, t49);
    			append_dev(div12, p12);
    			append_dev(div16, t51);
    			append_dev(div16, div13);
    			append_dev(div13, header13);
    			append_dev(header13, h113);
    			append_dev(div13, t53);
    			append_dev(div13, p13);
    			append_dev(div16, t55);
    			append_dev(div16, div14);
    			append_dev(div14, header14);
    			append_dev(header14, h114);
    			append_dev(div14, t57);
    			append_dev(div14, p14);
    			append_dev(div16, t59);
    			append_dev(div16, div15);
    			append_dev(div15, header15);
    			append_dev(header15, h115);
    			append_dev(div15, t61);
    			append_dev(div15, p15);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div16);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Content', slots, []);
    	let { realMSG = false } = $$props;
    	const writable_props = ['realMSG'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Content> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('realMSG' in $$props) $$invalidate(0, realMSG = $$props.realMSG);
    	};

    	$$self.$capture_state = () => ({ realMSG });

    	$$self.$inject_state = $$props => {
    		if ('realMSG' in $$props) $$invalidate(0, realMSG = $$props.realMSG);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*realMSG*/ 1) {
    			{
    				setTimeout(
    					() => {
    						if (!realMSG) {
    							document.querySelector('.content').style.maxWidth = `65%`;
    						} else {
    							document.querySelector('.content').style.maxWidth = `45%`;
    						}
    					},
    					90
    				);
    			}
    		}
    	};

    	return [realMSG];
    }

    class Content extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { realMSG: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Content",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get realMSG() {
    		throw new Error("<Content>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set realMSG(value) {
    		throw new Error("<Content>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/createMSG.svelte generated by Svelte v3.48.0 */

    const file$2 = "src/createMSG.svelte";

    // (9:0) {:else}
    function create_else_block$1(ctx) {
    	let div;
    	let input;
    	let t;
    	let textarea;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			textarea = element("textarea");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "titleMSG svelte-1tup5rt");
    			add_location(input, file$2, 10, 8, 266);
    			attr_dev(textarea, "name", "");
    			attr_dev(textarea, "id", "");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "class", "MSG svelte-1tup5rt");
    			add_location(textarea, file$2, 11, 8, 311);
    			attr_dev(div, "id", "fakeCreateMSG");
    			attr_dev(div, "class", "svelte-1tup5rt");
    			add_location(div, file$2, 9, 4, 233);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t);
    			append_dev(div, textarea);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(9:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (4:0) {#if realMSG}
    function create_if_block$1(ctx) {
    	let div;
    	let input;
    	let t;
    	let textarea;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			textarea = element("textarea");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "titleMSG svelte-1tup5rt");
    			add_location(input, file$2, 5, 8, 97);
    			attr_dev(textarea, "name", "");
    			attr_dev(textarea, "id", "");
    			attr_dev(textarea, "cols", "30");
    			attr_dev(textarea, "rows", "10");
    			attr_dev(textarea, "class", "MSG svelte-1tup5rt");
    			add_location(textarea, file$2, 6, 8, 142);
    			attr_dev(div, "id", "createMSG");
    			attr_dev(div, "class", "svelte-1tup5rt");
    			add_location(div, file$2, 4, 4, 68);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t);
    			append_dev(div, textarea);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(4:0) {#if realMSG}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*realMSG*/ ctx[0]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CreateMSG', slots, []);
    	let { realMSG = false } = $$props;
    	const writable_props = ['realMSG'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CreateMSG> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('realMSG' in $$props) $$invalidate(0, realMSG = $$props.realMSG);
    	};

    	$$self.$capture_state = () => ({ realMSG });

    	$$self.$inject_state = $$props => {
    		if ('realMSG' in $$props) $$invalidate(0, realMSG = $$props.realMSG);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [realMSG];
    }

    class CreateMSG extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { realMSG: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CreateMSG",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get realMSG() {
    		throw new Error("<CreateMSG>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set realMSG(value) {
    		throw new Error("<CreateMSG>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/ButtonMSG.svelte generated by Svelte v3.48.0 */

    const file$1 = "src/ButtonMSG.svelte";

    function create_fragment$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "+";
    			attr_dev(button, "id", "showMSG");
    			attr_dev(button, "class", "svelte-ixabry");
    			add_location(button, file$1, 3, 0, 20);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ButtonMSG', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ButtonMSG> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	return [click_handler];
    }

    class ButtonMSG extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonMSG",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (38:1) {:else}
    function create_else_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "outBackdropMSG svelte-84czok");
    			add_location(div, file, 38, 2, 1086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(38:1) {:else}",
    		ctx
    	});

    	return block;
    }

    // (36:1) {#if realMSG}
    function create_if_block(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "inBackdropMSG svelte-84czok");
    			add_location(div, file, 36, 2, 1041);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(36:1) {#if realMSG}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let sidebar;
    	let t0;
    	let content;
    	let t1;
    	let t2;
    	let createmsg;
    	let t3;
    	let buttonmsg;
    	let current;

    	sidebar = new SideBar({
    			props: {
    				appear: /*appear*/ ctx[2],
    				allSideElems: /*allSideElems*/ ctx[1]
    			},
    			$$inline: true
    		});

    	content = new Content({
    			props: { realMSG: /*realMSG*/ ctx[0] },
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if (/*realMSG*/ ctx[0]) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	createmsg = new CreateMSG({
    			props: { realMSG: /*realMSG*/ ctx[0] },
    			$$inline: true
    		});

    	buttonmsg = new ButtonMSG({ $$inline: true });
    	buttonmsg.$on("click", /*handleClick*/ ctx[3]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(sidebar.$$.fragment);
    			t0 = space();
    			create_component(content.$$.fragment);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			create_component(createmsg.$$.fragment);
    			t3 = space();
    			create_component(buttonmsg.$$.fragment);
    			attr_dev(main, "class", "svelte-84czok");
    			add_location(main, file, 32, 0, 959);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(sidebar, main, null);
    			append_dev(main, t0);
    			mount_component(content, main, null);
    			append_dev(main, t1);
    			if_block.m(main, null);
    			append_dev(main, t2);
    			mount_component(createmsg, main, null);
    			append_dev(main, t3);
    			mount_component(buttonmsg, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const sidebar_changes = {};
    			if (dirty & /*allSideElems*/ 2) sidebar_changes.allSideElems = /*allSideElems*/ ctx[1];
    			sidebar.$set(sidebar_changes);
    			const content_changes = {};
    			if (dirty & /*realMSG*/ 1) content_changes.realMSG = /*realMSG*/ ctx[0];
    			content.$set(content_changes);

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(main, t2);
    				}
    			}

    			const createmsg_changes = {};
    			if (dirty & /*realMSG*/ 1) createmsg_changes.realMSG = /*realMSG*/ ctx[0];
    			createmsg.$set(createmsg_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(content.$$.fragment, local);
    			transition_in(createmsg.$$.fragment, local);
    			transition_in(buttonmsg.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(content.$$.fragment, local);
    			transition_out(createmsg.$$.fragment, local);
    			transition_out(buttonmsg.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(sidebar);
    			destroy_component(content);
    			if_block.d();
    			destroy_component(createmsg);
    			destroy_component(buttonmsg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let allSideElems;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let appear = true;
    	let realMSG = false;

    	let extraProffs = [
    		'Miner',
    		'Microbiologist',
    		'Anesthesiologist',
    		'C++ programmer',
    		'Car mechanic',
    		'Meme enthusiast (fancy)'
    	];

    	let extraSubs = ['Currently none (loser)'];

    	let extraAbout = [
    		'My name is Ruslan, i am 16 year old loser, writing a website. Thanks for your attention, i appreciate :)',
    		'i am also an interesting persona (78% legit)'
    	];

    	const handleClick = () => {
    		$$invalidate(0, realMSG = !realMSG);
    	};

    	setInterval(() => console.log(allSideElems), 5000);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		SideBar,
    		Content,
    		CreateMsg: CreateMSG,
    		ButtonMSG,
    		appear,
    		realMSG,
    		extraProffs,
    		extraSubs,
    		extraAbout,
    		handleClick,
    		allSideElems
    	});

    	$$self.$inject_state = $$props => {
    		if ('appear' in $$props) $$invalidate(2, appear = $$props.appear);
    		if ('realMSG' in $$props) $$invalidate(0, realMSG = $$props.realMSG);
    		if ('extraProffs' in $$props) $$invalidate(4, extraProffs = $$props.extraProffs);
    		if ('extraSubs' in $$props) $$invalidate(5, extraSubs = $$props.extraSubs);
    		if ('extraAbout' in $$props) $$invalidate(6, extraAbout = $$props.extraAbout);
    		if ('allSideElems' in $$props) $$invalidate(1, allSideElems = $$props.allSideElems);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(1, allSideElems = [
    		{
    			number: 0,
    			content: 'Proffesions',
    			showExtra: false,
    			extraContent: extraProffs
    		},
    		{
    			number: 1,
    			content: 'Subscriptions',
    			showExtra: false,
    			extraContent: extraSubs
    		},
    		{
    			number: 2,
    			content: 'About us',
    			showExtra: false,
    			extraContent: extraAbout
    		}
    	]);

    	return [realMSG, allSideElems, appear, handleClick];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
