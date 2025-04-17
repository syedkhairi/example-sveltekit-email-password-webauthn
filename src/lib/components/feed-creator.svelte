<script lang="ts">
    import { mode } from 'mode-watcher';
    import { writable } from 'svelte/store';
    import {
        SvelteFlow,
        Controls,
        Background,
        BackgroundVariant,
        MiniMap,
        type Node,
        type Edge,
        Position
    } from '@xyflow/svelte';
    
    const nodes = writable<Node[]>([
        {
            id: 'A',
            type: 'group',
            data: {},
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            position: { x: 0, y: 0 },
            style: 'width: 170px; height: 140px;'
        },
        {
            id: 'A-1',
            type: 'input',
            data: { label: 'child 1' },
            position: { x: 10, y: 10 },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            parentId: 'A',
            extent: 'parent'
        },
        {
            id: 'A-2',
            data: { label: 'child 2' },
            position: { x: 10, y: 90 },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            parentId: 'A',
            extent: 'parent'
        },
        {
            id: 'B',
            type: 'output',
            position: { x: -100, y: 200 },
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,
            data: { label: 'node b' }
        },
        {
            id: 'C',
            type: 'output',
            sourcePosition: Position.Bottom,
            targetPosition: Position.Top,   
            position: { x: 100, y: 200 },
            data: { label: 'node c' }
        }
    ]);
    
    const edges = writable<Edge[]>([
        { id: 'a1-a2', source: 'A-1', target: 'A-2', type: 'smoothstep', animated: true },
        { id: 'a1-b', source: 'A-1', target: 'B', type: 'smoothstep', animated: true },
        { id: 'a1-c', source: 'A-1', target: 'C', type: 'smoothstep', animated: true },
        { id: 'a2-b', source: 'A-2', target: 'B', type: 'smoothstep', animated: true, label: "and" },
        { id: 'a2-c', source: 'A-2', target: 'C', type: 'smoothstep', animated: true }
    ]);
    
    const snapGrid: [number, number] = [25, 25];
</script>

<!--
👇 By default, the Svelte Flow container has a height of 100%.
This means that the parent container needs a height to render the flow.
-->
<div class="h-full w-full">
    <SvelteFlow
        {nodes}
        {edges}
        colorMode={$mode}
        fitView
        on:nodeclick={(event) => console.log('on node click', event.detail.node)}
        >
        <Controls />
        <Background variant={BackgroundVariant.Dots} />
        <MiniMap />
    </SvelteFlow>
</div>