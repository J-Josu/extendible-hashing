<script lang="ts">
  import { HashRecord } from '$lib/logic/record';
  import { directory } from '$lib/stores';
  import { uniqueValue } from '$lib/utils/random';

  $: elements = directory._buckets;
  let count = 0;

  const addElement = () => {
    const val = uniqueValue();
    const item = {
      id: val,
      pow: count ** 2,
    };
    directory.insert(
      count,
      new HashRecord<{ id: number; pow: number }>(count, item)
    );
    count++;
    // elements = directory.buckets;
  };
</script>

<button on:click={addElement}>Increment</button>

<ul>
  {#each elements as element}
    <li>{JSON.stringify(element, null, 2)}</li>
  {/each}
</ul>
