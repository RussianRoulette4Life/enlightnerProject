<script>
	// import all components
	import SideBar from './sideBar.svelte'
	import Content from './content.svelte'
	import CreateMsg from './createMSG.svelte'
	import ButtonMSG from './ButtonMSG.svelte'
	// a class for data storage used in the sideBar block
	class sideBarElement {
		constructor(info, animationParams = []){
			this.info = info
			this.animationParams = animationParams
		}
	}
	let appear = true
	let realMSG = false
	// all the data
	let extraProffsInfo = ['Miner', 'Microbiologist', 'Anesthesiologist', 'C++ programmer',
'Car mechanic', 'Meme enthusiast (fancy)']
	let extraSubsInfo = ['Currently none (loser)']
	let extraAboutInfo = ['My name is Ruslan, i am 16 year old loser, writing a website. Thanks for your attention, i appreciate :)', 
'i am also an interesting persona (78% legit)']
	let extraGPLInfo = ['The GNU General Public License is a free, copyleft license for software and other kinds of works.','The licenses for most software and other practical works are designed to take away your freedom to share and change the works. By contrast, the GNU General Public License is intended to guarantee your freedom to share and change all versions of a program--to make sure it remains free software for all its users. We, the Free Software Foundation, use the GNU General Public License for most of our software; it applies also to any other work released this way by its authors. You can apply it to your programs, too.']
	const handleClick = () => {
		realMSG = !realMSG
	}
	// creating a bunch of data-bearing objects
	let extraProffs = new sideBarElement(extraProffsInfo)
	let extraSubs = new sideBarElement(extraSubsInfo)
	let extraAbout = new sideBarElement(extraAboutInfo)
	let extraGPL = new sideBarElement(extraGPLInfo)
	// reactive list of ALL sideBar info related stuff. gets sent to sideBar block
	let allSideElems = [
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
		extraContent:extraAbout},
		{number:3,
		content: 'GNU Public License (GPL)',
		showExtra: false,
		extraContent:extraGPL}
	]
</script>

<main>
	<!-- quite clean huh? -->
	<SideBar {appear} {allSideElems}/>
	<Content {realMSG}/>
	<CreateMsg {realMSG}/>
	<ButtonMSG on:click={handleClick}/>
	
</main>

<style>
/* yea theres nothin */
	main{
		display:flex;
	}
</style>
