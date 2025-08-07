import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Download,
  Edit,
  Trash2,
  Star,
  Target
} from 'lucide-react';

interface CVUploadProps {
  userCV: any;
  onCVUpdate: (cv: any) => void;
}

const CVUpload: React.FC<CVUploadProps> = ({ userCV, onCVUpdate }) => {
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    setIsAnalyzing(true);
    
    // Simulate file analysis
    setTimeout(() => {
      const mockCV = {
        id: Date.now(),
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        uploadDate: new Date().toISOString(),
        analysisScore: Math.floor(Math.random() * 30) + 70, // 70-100
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL'],
        experience: '5 years',
        suggestions: [
          'Add more quantifiable achievements',
          'Include relevant keywords for ATS optimization',
          'Highlight leadership experience',
          'Add certification details'
        ]
      };
      
      onCVUpdate(mockCV);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analyzing Your CV</h1>
          <p className="text-gray-600">Our AI is reviewing your resume and generating optimization suggestions...</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-pulse">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div className="w-full max-w-md bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
            </div>
            <p className="text-gray-600">Analyzing skills, experience, and optimization opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userCV) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Your CV</h1>
          <p className="text-gray-600">Let our AI analyze your resume and optimize it for maximum impact</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-200">
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Drop your CV here or click to browse
            </h3>
            <p className="text-gray-600 mb-6">
              Supports PDF, DOC, DOCX files up to 10MB
            </p>
            <input
              type="file"
              id="cv-upload"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
            />
            <label
              htmlFor="cv-upload"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer inline-block"
            >
              Choose File
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">ATS Optimization</h3>
            <p className="text-sm text-gray-600">Optimize for Applicant Tracking Systems</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Skill Analysis</h3>
            <p className="text-sm text-gray-600">Identify and highlight key skills</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Suggestions</h3>
            <p className="text-sm text-gray-600">Get AI-powered improvement tips</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CV Analysis Complete</h1>
        <p className="text-gray-600">Here's what we found and how to improve your resume</p>
      </div>

      {/* CV Info Card */}
      <div className="bg-white rounded-2xl p-8 border border-gray-200">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{userCV.fileName}</h3>
              <p className="text-gray-600">{userCV.fileSize} • Uploaded {new Date(userCV.uploadDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
              <Edit className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Analysis Score */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Optimization Score</h4>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-green-600">{userCV.analysisScore}%</span>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${userCV.analysisScore}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Great job! Your CV is well-optimized for most job applications.</p>
        </div>

        {/* Skills Detected */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Skills Detected</h4>
          <div className="flex flex-wrap gap-2">
            {userCV.skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Improvement Suggestions</h4>
          <div className="space-y-3">
            {userCV.suggestions.map((suggestion: string, index: number) => (
              <div key={index} className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:scale-105">
          Find Matching Jobs
        </button>
        <button className="flex-1 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all">
          Upload New CV
        </button>
      </div>
    </div>
  );
};

export default CVUpload;