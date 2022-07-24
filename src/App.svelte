<script>
	import SideBar from './sideBar.svelte'
	import Content from './content.svelte'
	import CreateMsg from './createMSG.svelte'
	import ButtonMSG from './ButtonMSG.svelte'
	let appear = true
	let realMSG = false
	let extraProffs = ['Miner', 'Microbiologist', 'Anesthesiologist', 'C++ programmer',
'Car mechanic', 'Meme enthusiast (fancy)']
	let extraSubs = ['Currently none (loser)']
	let extraAbout = ['My name is Ruslan, i am 16 year old loser, writing a website. Thanks for your attention, i appreciate :)', 
'i am also an interesting persona (78% legit)']
	const handleClick = () => {
		realMSG = !realMSG
	}
	$: allSideElems = [
		{number:0,
		content:'Proffesions',
		showExtra: false,
		extraContent:extraProffs},
		{number:1,
		content:'Subscriptions',
		showExtra: false,
		extraContent:extraSubs},
		{number:2,
		content:'About us',
		showExtra: false,
		extraContent:extraAbout}
	]
	setInterval(()=>console.log(allSideElems), 5000)
</script>

<main>
	<SideBar {appear} {allSideElems}/>
	<Content {realMSG}/>
	{#if realMSG}
		<div class="inBackdropMSG"></div>
	{:else}
		<div class="outBackdropMSG"></div>
	{/if}
	<CreateMsg {realMSG}/>
	<ButtonMSG on:click={handleClick}/>
	
</main>

<style>

	main{
		display:flex;
	}
	.inBackdropMSG, .outBackdropMSG{
		position: fixed;
		height: 100%;
	}
	.inBackdropMSG{
		width: 71%;
		background: rgba(0, 0, 0, 0.404);
		animation: 0.35s ease-out 0s 1 normal fadeIn;
	}
	.outBackdropMSG{
        background: rgba(0,0,0,0);
		width: 0%;
		height: 100%;
		animation: 0.35s ease-out 0s 1 normal fadeOut;
	}
	@keyframes fadeIn {
		from {background: rgba(0, 0, 0, 0); width: 0%;} to {background: rgba(0, 0, 0, 0.404);width: 71%;}
	}
	@keyframes fadeOut {
		from {background: rgba(0, 0, 0, 0.404);width: 71%} to {background: rgba(0, 0, 0, 0);width: 0%}
	}
</style>