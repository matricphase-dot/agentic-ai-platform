export default function GuidePage() {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8">User Guide</h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <p>1. <strong>Sign up</strong> for a free account.</p>
          <p>2. <strong>Log in</strong> to access your dashboard.</p>
          <p>3. Explore the sidebar to navigate features: Agents, Marketplace, Staking, Governance, etc.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Agents</h2>
          <p><strong>Create an agent:</strong></p>
          <ol className="list-decimal list-inside ml-4 space-y-1 mb-4">
            <li>Click "Agents" in the sidebar, then "Create Agent".</li>
            <li>Enter a name and description.</li>
            <li>Optionally, add configuration (model, system prompt).</li>
            <li>Click "Create". Your agent will appear in the list.</li>
          </ol>
          <p><strong>View agent details:</strong> Click on any agent to see its details, status, and configuration.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Marketplace</h2>
          <p>Browse pre‑built agent templates. To deploy:</p>
          <ol className="list-decimal list-inside ml-4 space-y-1 mb-4">
            <li>Go to "Marketplace".</li>
            <li>Choose a template (e.g., Chatbot).</li>
            <li>Click "Deploy". A new agent will be created with that template's configuration.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Staking</h2>
          <p>Stake tokens on agents you support:</p>
          <ol className="list-decimal list-inside ml-4 space-y-1 mb-4">
            <li>Go to "Staking".</li>
            <li>Select an agent from the dropdown.</li>
            <li>Enter the amount of tokens to stake.</li>
            <li>Click "Stake". Your stake will appear in the list.</li>
          </ol>
          <p>Stakers earn a share of the agent's earnings based on their stake proportion.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Governance</h2>
          <p>Participate in platform decisions:</p>
          <ul className="list-disc list-inside ml-4 space-y-1 mb-4">
            <li><strong>View proposals:</strong> All active and past proposals are listed.</li>
            <li><strong>Vote:</strong> For active proposals, choose an option and click "Vote". Your voting power is based on your total staked tokens.</li>
            <li><strong>Create proposals:</strong> (Admins only) Provide a title, description, options, and end date.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Compute Nodes</h2>
          <p>Register your own node to run agents and earn rewards:</p>
          <ol className="list-decimal list-inside ml-4 space-y-1 mb-4">
            <li>Go to "Nodes".</li>
            <li>Click "Register Node".</li>
            <li>Enter a name and endpoint URL (where your node listens).</li>
            <li>Submit. Your node will appear in the list.</li>
          </ol>
          <p>You can later claim tasks and earn rewards.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Teams</h2>
          <p>Collaborate with others:</p>
          <ol className="list-decimal list-inside ml-4 space-y-1 mb-4">
            <li>Go to "Teams".</li>
            <li>Click "Create Team".</li>
            <li>Give it a name and description.</li>
            <li>After creation, you can add members (coming soon).</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Webhooks</h2>
          <p>Get real‑time events:</p>
          <ol className="list-decimal list-inside ml-4 space-y-1 mb-4">
            <li>Go to "Webhooks".</li>
            <li>Click "Create Webhook".</li>
            <li>Provide a name, URL, and events (comma‑separated).</li>
            <li>Click "Create". The webhook will receive POST requests for those events.</li>
          </ol>
          <p>You can delete webhooks from the list.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Reviews</h2>
          <p>Rate and comment on agents:</p>
          <ol className="list-decimal list-inside ml-4 space-y-1 mb-4">
            <li>Go to "Reviews".</li>
            <li>Select an agent from the dropdown.</li>
            <li>Choose a rating (1–5) and add a comment.</li>
            <li>Click "Submit Review". Your review will appear in the list.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Audit Logs</h2>
          <p>All actions performed on the platform are recorded. View them in the "Audit Logs" page. This ensures transparency and accountability.</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">FAQs</h2>
          <div className="space-y-4">
            <div><p className="font-semibold">What tokens do I use for staking?</p><p>Currently, staking is simulated. In the future, we will launch a platform token.</p></div>
            <div><p className="font-semibold">How do I earn rewards?</p><p>Stakers earn a portion of the agent's earnings. The exact mechanism will be explained when tokenomics are finalized.</p></div>
            <div><p className="font-semibold">Can I run agents locally?</p><p>Yes, by registering your own compute node, you can run agents on your own hardware.</p></div>
            <div><p className="font-semibold">Is the platform open source?</p><p>We plan to open‑source the core soon.</p></div>
          </div>
        </section>
      </div>
    </div>
  );
}
