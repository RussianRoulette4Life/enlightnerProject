<script>
    export let appear = true
    export let allSideElems = []
    import { fly } from 'svelte/transition'
    // activates when any side element is clicked, shows "extras"
    const handleOpen = (number) =>{
        //allSideElems.forEach(element => {
        //    if (element.number === number){
        //        element.showExtra =! element.showExtra
        //        console.log(`element number ${element.number}, number var passed to func = ${number}${element.showExtra}`)
        //    }
        //}
        //)
        settingAnimationOrder(allSideElems[number])
        allSideElems[number].showExtra=!allSideElems[number].showExtra
        console.log(allSideElems[number])
    }
    ////copied code from a svelte tutorial for a smoooth transition////
    function typewriter(node, { speed = 1.5 }) {
	const valid = (
		node.childNodes.length === 1 &&
		node.childNodes[0].nodeType === Node.TEXT_NODE
	);

	if (!valid) {
		throw new Error(`This transition only works on elements with a single text node child`);
	}

	const text = node.textContent;
	const duration = text.length / (speed * 0.01);

	return {
		duration,
		tick: t => {
			const i = Math.trunc(text.length * t);
			node.textContent = text.slice(0, i);
		}
	};
}
    ////////
    let logoAppear = false
    const standardAnimation = {y:-50, duration:200}
    // this is purely for the fancy logo appearence
    setTimeout(()=>{logoAppear=!logoAppear},500)
    // gets an element and assigns an animation to each bit of information (element.extraContent.info bits)
    const settingAnimationOrder = (element) =>{
        for (let index = 0; index<element.extraContent.info.length;index++){
        let animationParams = {y: standardAnimation.y - (15*(index+1)), duration:standardAnimation.duration+(150*(index+1))}
        element.extraContent.animationParams.push(animationParams)
        console.log(element.extraContent)
    }
    }

</script>
{#if appear}    
    <div class="sideBar">
        {#if logoAppear}
        <div class="logo">
            <h1 transition:typewriter>MY TWITTER CLONE</h1>
        </div>
        {/if}
        <!-- this bit was a paaaaain, i had to rewrite it soo much due to changes in the allSideElems object, but i worked it all out -->
        {#each allSideElems as Elem (Elem.number)}
            <div class="sideElem" on:click|self={(e)=>handleOpen(Elem.number)}>
                <h1 style="text-align: center;" on:click|self={(e)=>handleOpen(Elem.number)}>{Elem.number+1}. {Elem.content}</h1>
                {#if Elem.showExtra}
                    {#each Elem.extraContent.info as extraContentNugget, i}
                        <div class="selectableSegment" in:fly={Elem.extraContent.animationParams[i]} out:fly={{x:-200, duration:300}}><p>{i+1}. {extraContentNugget}</p></div>
                    {/each}
                {:else}
                <p style="font-size:10pt;">!Click for more info!</p>                    
                {/if}
            </div>
        {/each}
    </div>
{/if}
<style>
    .sideBar{
        overflow: scroll;
        display:flex;
        position: fixed;
        flex-direction: column;
        height: 100%;
        border: 5px rgb(148, 69, 41) solid;
        width: 24%;
        text-align: center;
    }
    .sideElem{
        padding: 5px 0px 5px 0px;
        background: rgba(41, 44, 139, 0.473);
        padding: 20px 25% 20px 25%;
        width:50%;
        border-top: 5px rgb(148, 69, 41) solid;
        display: flex;
        flex-direction: column;
        align-items: center;
        position:relative
    }
    .sideBar > .logo{
        background: rgb(39, 39, 39);
        text-align: center;
    }
    .sideElem:hover, .selectableSegment:hover{
        background: rgba(50, 56, 240, 0.473);
        border-top: 5px rgb(219, 87, 39) solid;
        cursor: pointer;
    }
    .selectableSegment{
        background: rgba(41, 44, 139, 0.473);
        padding: auto;
        border: 3px solid #944529;
        width: 195%;
        justify-content: center;
        position:relative
    }
    .selectableSegment:hover{
        animation: 0.25s ease-out 0s 2 alternate slide;
    }
    @keyframes slide {
        from {top:0px} to {top:3px}
    }
</style>