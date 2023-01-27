<script lang="ts">
  import { HashRecord } from '$lib/stuff/record-old';

  type Item = {
    val: number;
    val2: number;
  };
  const record = new HashRecord<Item>(1, { val: 6, val2: 10 });

  let count = 0;
  let selected = '';
  const update = () => {
    record.updateValue({ [`${selected}`]: ++count });
  };

  const keys = Object.keys(record.getValues()) as Array<keyof Item>;
</script>

<div>
  {#each keys as key}
    <p on:click={() => (selected = key)}>{key}: {$record[key]}</p>
  {/each}
</div>
<button on:click={update}>cambiar</button>

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
