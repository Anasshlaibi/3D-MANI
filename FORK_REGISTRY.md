# Fork Registry & Upstream Governance

## Document ID: `FORK_REGISTRY.md`

### Core Policy: Zero-Fork Architecture

We do not fork upstream open-source repositories automatically.
Our strict hierarchy of preference is:

$$\text{Direct Dependency} \longrightarrow \text{Adapter / Wrapper} \longrightarrow \text{Legally Compatible Extension} \longrightarrow \text{Maintained Internal Fork}$$

Forking is an extreme measure permitted **only** when:
1. Upstream architecture explicitly prevents a required manufacturing capability;
2. Upstream project is abandoned with critical unmerged CVEs or kernel bugs;
3. Patches cannot reasonably be upstreamed within release cycles;
4. Specific defense or export control compliance requires air-gapped, modified source trees.

---

## Active Forks Register

*Currently Active Forks: **0** (All tier 1 and tier 2 tools operate via external dependencies and adapters).*

| Upstream Repository | Upstream Commit / Tag | Reason for Fork | Modifications | Merge Strategy | License | Responsible Subsystem | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| *None* | *N/A* | *No active forks required. build123d and OCCT wrapped via adapter pattern.* | *None* | *Upstream Tracking* | *N/A* | *CAD Core* | **ZERO_FORKS_POLICY_ACTIVE** |

---

## Fork Ingestion Protocol

When a team member proposes an internal fork, they must open an Architectural Decision Record (ADR) and register:
1. `upstream_repository`: Exact GitHub / GitLab clone URL
2. `upstream_commit`: Pinned Git commit SHA
3. `reason_for_fork`: Documented architectural blocker that adapter pattern cannot solve
4. `modifications`: Line-by-line diff of added or altered functionality
5. `merge_strategy`: Plan for rebasing against upstream stable releases
6. `license`: Verified compatibility with Apache-2.0 product boundary
7. `responsible_subsystem`: Engineering team owner accountable for security patches
