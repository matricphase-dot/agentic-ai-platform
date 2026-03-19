"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Vote, Plus, Clock, Users, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Proposal {
  id: string;
  title: string;
  description: string;
  options: string[];
  endDate: string;
  status: string;
  createdAt: string;
  createdBy: { email: string };
  _count: { votes: number };
  results?: { [key: string]: number };
  totalWeight?: number;
  userVote?: { option: string; weight: number } | null;
}

export default function GovernancePage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [optionsText, setOptionsText] = useState("Yes, No, Abstain");
  const [endDate, setEndDate] = useState("");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [voting, setVoting] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'passed' | 'rejected'>('active');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      const res = await api.get('/governance/proposals');
      setProposals(res.data);
    } catch (error) {
      console.error('Failed to fetch proposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProposalDetails = async (proposal: Proposal) => {
    try {
      const res = await api.get(`/governance/proposals/${proposal.id}`);
      // Add user's vote if any
      const userVote = res.data.votes?.find((v: any) => v.user.email === user?.email);
      setSelectedProposal({ ...res.data, userVote });
    } catch (error) {
      console.error('Failed to fetch proposal details:', error);
    }
  };

  const createProposal = async () => {
    const options = optionsText.split(',').map(s => s.trim()).filter(s => s);
    if (!newTitle || !newDesc || options.length < 2 || !endDate) {
      alert('Please fill all fields and provide at least 2 options.');
      return;
    }
    try {
      const res = await api.post('/governance/proposals', {
        title: newTitle,
        description: newDesc,
        options,
        endDate
      });
      setProposals([res.data, ...proposals]);
      setShowCreate(false);
      setNewTitle("");
      setNewDesc("");
      setOptionsText("Yes, No, Abstain");
      setEndDate("");
    } catch (error) {
      console.error('Create failed:', error);
      alert('Failed to create proposal');
    }
  };

  const vote = async (proposalId: string, option: string) => {
    setVoting(proposalId);
    try {
      await api.post(`/governance/proposals/${proposalId}/vote`, { option });
      alert('Vote cast successfully!');
      await fetchProposals(); // refresh list
      if (selectedProposal?.id === proposalId) {
        await fetchProposalDetails(selectedProposal);
      }
    } catch (error: any) {
      console.error('Vote failed:', error);
      alert(error.response?.data?.error || 'Failed to vote');
    } finally {
      setVoting(null);
    }
  };

  const finalizeProposal = async (proposalId: string) => {
    try {
      await api.post(`/governance/proposals/${proposalId}/finalize`);
      await fetchProposals();
      if (selectedProposal?.id === proposalId) {
        await fetchProposalDetails(selectedProposal);
      }
    } catch (error) {
      console.error('Finalize failed:', error);
    }
  };

  const filteredProposals = proposals.filter(p => p.status === tab);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Governance</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Proposal
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['active', 'passed', 'rejected'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 font-medium capitalize ${tab === t ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Proposals list */}
        <div className="lg:col-span-1 space-y-2">
          {filteredProposals.length === 0 ? (
            <p className="text-gray-500">No {tab} proposals.</p>
          ) : (
            filteredProposals.map(p => (
              <div
                key={p.id}
                onClick={() => fetchProposalDetails(p)}
                className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition ${selectedProposal?.id === p.id ? 'border-blue-500 bg-blue-50' : 'bg-white'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(p.status)}
                  <h3 className="font-medium flex-1">{p.title}</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(p.endDate).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p._count.votes} votes</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected proposal details */}
        <div className="lg:col-span-2">
          {selectedProposal ? (
            <div className="bg-white border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedProposal.status)}
                  <h2 className="text-2xl font-bold">{selectedProposal.title}</h2>
                </div>
                {selectedProposal.status === 'active' && new Date() > new Date(selectedProposal.endDate) && (
                  <button
                    onClick={() => finalizeProposal(selectedProposal.id)}
                    className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-lg hover:bg-yellow-200"
                  >
                    Finalize
                  </button>
                )}
              </div>
              <p className="text-gray-700 mb-4">{selectedProposal.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-4">
                <div>Created by: {selectedProposal.createdBy.email}</div>
                <div>Ends: {new Date(selectedProposal.endDate).toLocaleString()}</div>
              </div>

              {selectedProposal.status === 'active' && new Date() <= new Date(selectedProposal.endDate) ? (
                <>
                  <h3 className="text-lg font-semibold mb-3">Cast Your Vote</h3>
                  {selectedProposal.userVote ? (
                    <div className="bg-green-50 p-3 rounded-lg mb-4">
                      You voted <span className="font-bold">{selectedProposal.userVote.option}</span> with {selectedProposal.userVote.weight} AGIX weight.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedProposal.options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => vote(selectedProposal.id, opt)}
                          disabled={voting === selectedProposal.id}
                          className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 disabled:opacity-50 flex items-center gap-1"
                        >
                          {voting === selectedProposal.id && <Loader2 className="w-4 h-4 animate-spin" />}
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-600 mb-4 italic">Voting period has ended.</p>
              )}

              <h3 className="text-lg font-semibold mb-3">Results</h3>
              {selectedProposal.results ? (
                <div className="space-y-3">
                  {selectedProposal.options.map(opt => (
                    <div key={opt}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{opt}</span>
                        <span className="font-medium">{selectedProposal.results![opt]} AGIX ({selectedProposal.totalWeight ? ((selectedProposal.results![opt] / selectedProposal.totalWeight) * 100).toFixed(1) : 0}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full"
                          style={{ width: `${selectedProposal.totalWeight ? (selectedProposal.results![opt] / selectedProposal.totalWeight) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="text-sm text-gray-500 mt-2">Total weighted votes: {selectedProposal.totalWeight} AGIX</div>
                </div>
              ) : (
                <p>No votes yet.</p>
              )}
            </div>
          ) : (
            <div className="bg-white border rounded-lg p-12 text-center text-gray-500">
              <Vote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">Select a Proposal</h3>
              <p>Choose a proposal from the left to view details and vote.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Proposal Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create New Proposal</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2"
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Options (comma separated)</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded-lg px-3 py-2"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={createProposal}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}