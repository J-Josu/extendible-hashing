<script lang="ts">
  import type { HashValue } from '$lib/logic/types';
  import { HashRecord } from '$lib/stuff/record-old';
  import type { ObjectLiteral } from '$lib/types/hashing';

  export let values: ObjectLiteral;
  export let hash: HashValue;

  const record = new HashRecord(hash, values);

  $: record.updateValue(values);
  let count = 0;
  let selected = '';
  // const update = () => {
  //   record.updateValue({ [`${selected}`]: ++count });
  // };

  const keys = Object.keys(record.getValues()) as Array<keyof typeof values>;
</script>

<div>
  {#each keys as key}
    <p >{key}: {$record[key]}</p>
  {/each}
</div>
<!-- <button on:click={update}>cambiar</button> -->

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
