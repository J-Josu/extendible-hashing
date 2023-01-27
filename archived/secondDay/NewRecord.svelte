<script lang="ts">
  import type { RecordData } from './record';

  export let record: RecordData;
</script>

<div>
  <p>hash: {record.hash}</p>
  {#each Object.entries(record.fields) as [key, value] (key)}
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
