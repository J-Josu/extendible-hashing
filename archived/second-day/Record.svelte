<script lang="ts">
  import type { RecordState, RecordData } from './record';

  export let state: RecordState;
  export let data: RecordData;
</script>

<div>
  <p>hash: {$state.hash}</p>
  {#each Object.entries($data) as [key, value] (key)}
    <p>{key}: {value}</p>
  {/each}
</div>

<style>
  div {
    background-color: darkslategray;
    border: 1px solid var(--border-color-main);
    max-width: 16rem;
    padding: 0.8rem;
  }
  p {
    font-size: 2rem;
  }
</style>
