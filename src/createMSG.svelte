<script>
    export let realMSG = false
    import { fly } from 'svelte/transition'
    const flyParams = {x:500, duration:500}
    // fancy
</script>
{#if realMSG}
    <div id="createMSG" transition:fly={flyParams}>
        <input type="text" class="titleMSG">
        <textarea name="" id="" cols="30" rows="10" class="MSG"></textarea>
    </div>
{/if}

<style>
    div#createMSG{
        height:100%;
        background: rgba(36, 39, 112, 0.473);
        display: flex;
        flex-direction: column;
        position: fixed;
        align-items: center;
        width: 30%;
        margin: 3px;
    }
    div#createMSG{
        left:71%;
    }
    .titleMSG, .MSG{
        margin:10px 5px;
        font-size: 16pt;
        max-width: 80%;
        min-width: 80%;
        background: rgba(41, 44, 139, 0.473);
        color: white;
        font-weight: 500;
    }
</style>

