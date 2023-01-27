<script lang="ts">
  import type { HashRecord } from '$lib/ts-test/record';
  import type { ObjectLiteral } from '$lib/types/hashing';

  export let record: HashRecord<ObjectLiteral>;
  
  const keys = Object.keys(record.values) as Array<keyof typeof record>;
</script>

<div>
  <p>hash: {$record}</p>
  {#each Object.entries($record) as [key, value] (key)}
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
