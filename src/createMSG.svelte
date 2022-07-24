<script>
    export let realMSG = false
</script>
{#if realMSG}
    <div id="createMSG">
        <input type="text" class="titleMSG">
        <textarea name="" id="" cols="30" rows="10" class="MSG"></textarea>
    </div>
{:else}
    <div id="fakeCreateMSG">
        <input type="text" class="titleMSG">
        <textarea name="" id="" cols="30" rows="10" class="MSG"></textarea>
    </div>
{/if}

<style>
    div#createMSG, div#fakeCreateMSG{
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
        animation: 0.35s ease-out 0s 1 normal slide_out;
    }
    div#fakeCreateMSG{
        left:100%;
        animation: 0.35s ease-out 0s 1 normal slide_in;
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

    @keyframes slide_out{
        from {left:100%} to {left:71%}
    }
    @keyframes slide_in{
        from {left:71%} to {left:100%}
    }
</style>

